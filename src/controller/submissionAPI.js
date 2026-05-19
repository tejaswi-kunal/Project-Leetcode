const {validateLanguage,getLanguageId,submitBatch,submitToken}=require("../utils/ProblemUtility");
const Submission=require("../model/Submission");
const Problem=require("../model/Problems");
const User=require("../model/User");

const submitCode=async(req,res)=>{
    try{
        const problemID=req.params.id;
        const userID=req.result;

        if(!problemID || !userID)
        {
            return res.status(404).send("Valid ID Didnt Recieved Please Try Again With Valid ID");
        }

        const language=req.body.language;
        validateLanguage(language);

        const code = req.body.code;
        const DSAproblem=await Problem.findById(problemID);

        if(!DSAproblem) 
        {
            return res.status(404).send("Problem Not Found!");
        }

        // first phase update of the submission of the code
        const submittedCode=await Submission.create({
            problem:problemID,
            user:userID,
            submittedCode:{
                language:language,
                completeCode:code
            },
            testCasesTotal:DSAproblem.visibleTestCases.length+DSAproblem.hiddenTestCases.length
        });

        // now we have to check the result of the code using judge0
        const language_id=getLanguageId(language);

        const submission1=DSAproblem.visibleTestCases.map(({input,output})=>{
            return {
                source_code:code,
                language_id:language_id,
                stdin:input,
                expected_output:output
            }
        });
        const submission2=DSAproblem.hiddenTestCases.map(({input,output})=>{
            return {
                source_code:code,
                language_id:language_id,
                stdin:input,
                expected_output:output
            }
        });
        const submission=[...submission1,...submission2];

        const submitResult=await submitBatch(submission);
        const resultTokens=submitResult.map((value)=>value.token);
        const finalResult=await submitToken(resultTokens);

        // now we have to verify the result using the final result
        let testCasesPassed=0;
        let runtime=0;
        let memory=0;
        let status="Accepted"
        let errorMessege='';

        for(const element of finalResult)
        {
            if(element.status.id==3)
            {
                testCasesPassed=testCasesPassed+1;
                runtime=runtime+Number(element.time);
                memory=Math.max(memory,element.memory);
            }

            else if(element.status.id==4)
            {
                if(errorMessege=='')
                {
                    errorMessege = `Expected: ${element.expected_output} | Got: ${element.stdout}`;
                }
                if(status=="Accepted")
                {
                    status="Wrong Answer";
                }
            }

            else if(element.status.id==5)
            {
                if(errorMessege=='')
                {
                    errorMessege=element.stderr;
                }
                if(status=="Accepted")
                {
                    status="Time Limit Exceeded";
                }
            }

            else if(element.status.id==6)
            {
                if(errorMessege=='')
                {
                    errorMessege = element.compile_output || element.stderr;
                }
                if(status=="Accepted")
                {
                    status="Compilation Error";
                }
            }

            else if(element.status.id>=7 && element.status.id<=12)
            {
                if(errorMessege=='')
                {
                    errorMessege=element.stderr;
                }
                if(status=="Accepted")
                {
                    status="Runtime Error";
                }
            }

            else if(element.status.id==13)
            {
                if(errorMessege=='')
                {
                    errorMessege=element.stderr;
                }
                if(status=="Accepted")
                {
                    status="Internal Error";
                }
            }

            else 
            {
                if(errorMessege=='')
                {
                    errorMessege=element.stderr;
                }
                if(status=="Accepted")
                {
                    status="Error";
                }
            }
        }

        // now we have to update the submission of the phase1
        submittedCode.status=status;
        submittedCode.runtime=runtime;
        submittedCode.memory=memory;
        submittedCode.testCasesPassed=testCasesPassed;
        submittedCode.errorMessege=errorMessege;

        await submittedCode.save();

        // we have to also updated the problemSolved of user 
        const user=await User.findById(req.result);

        if(!user) 
        {
            return res.status(404).send("User Not Found!");
        }

        if(status=="Accepted")
        {
            user.acceptedSubmissions+=1;
        }

        if(!user.problemsSolved.includes(problemID) && status=='Accepted')
        {
            // if the current submittend problem is correct and its not in the list of solvedProblem 
            user.problemsSolved.push(problemID);
        }
        user.submissionsCount+=1;
        await user.save();
        res.status(201).send(submittedCode);
    }catch(err){
        res.status(400).send("Error : "+err.message);
    }
}

module.exports=submitCode;
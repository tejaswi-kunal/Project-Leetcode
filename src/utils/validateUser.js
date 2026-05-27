const validator=require('validator');

function validateRegister(data)
{
    if(!data || typeof data !== 'object')
    {
        throw new Error('Invalid input data!');
    }

    // require feilds checking
    const mandotaryFeilds=['userName','emailId','password'];
    const isAllowed=mandotaryFeilds.every((info)=>Object.keys(data).includes(info));

    if(!isAllowed)
    {
        throw new Error('All Mandotary Feilds Are Not Present!');
    }

    // removing the restricted feild
    const restrictedFields=[
    'rating',
    'totalSolved',
    'submissionsCount',
    'problemsSolved',
    'isVerified',
    'passwordChangedAt',
    'lastLogin'
    ];

    restrictedFields.forEach(field=>{
        if(data[field]!==undefined){
        delete data[field];
        }
    });

    //other schema validation check
    if(data.firstName && !(data.firstName?.length>=3 && data.firstName?.length<=50))
    {
        throw new Error('min Length of firstName should be 3 and max 50!');
    }

    if(!(data.userName.length>=3 && data.userName.length<=50))
    {
        throw new Error('min Length of userName should be 3 and max 50!');
    }

    if(data.age && data.age<=5)
    {
        throw new Error('min age should be 5!');
    }

    if(!validator.isEmail(data.emailId))
    {
        throw new Error('Invalid Email Formate!');
    }

    if(!validator.isStrongPassword(data.password))
    {
        throw new Error('Weak Password!');
    }


    if(data.gender && !(data.gender=='male' || data.gender=='female' || data.gender=='other'))
    {
        throw new Error("Gender can only one of these -> [male,female,other]");
    }

    if(data.github)
    {
        if(data.github.length > 150)
            throw new Error('Github link is too long!');

        if(!validator.isURL(data.github))
            throw new Error('Invalid Github URL!');
    }

    if(data.linkedin)
    {
        if(data.linkedin.length > 150)
            throw new Error('linkedin link is too long!');

        if(!validator.isURL(data.linkedin))
            throw new Error('Invalid linkedin URL!');
    }

    if(data.bio && data.bio.length > 300)
    {
        throw new Error("Bio is too long!");
    }

    if(data.college && data.college.length > 100)
    {
        throw new Error(('College name is too long!'));
    }

    if(data.profilePicture)
    {
        if(data.profilePicture.length > 300)
            throw new Error('Profile picture link too long!');

        if(!validator.isURL(data.profilePicture))
            throw new Error('Invalid profile picture URL!');
    }

}

const validateUpdateProfile = (data) => {

    const allowedUpdates = [
        "firstName",
        "lastName",
        "age",
        "gender",
        "profilePicture",
        "bio",
        "github",
        "linkedin",
        "college"
    ];

    const receivedUpdates = Object.keys(data);

    const isValidUpdate = receivedUpdates.every((field) =>
        allowedUpdates.includes(field)
    );

    if (!isValidUpdate) {
        throw new Error("Invalid Updates Received!");
    }

    if (data.firstName !== undefined) {

        if (data.firstName.trim().length < 3) {
            throw new Error("First Name Should Contain Minimum 3 Characters!");
        }

        if (data.firstName.trim().length > 50) {
            throw new Error("First Name Should Be Less Than 50 Characters!");
        }
    }

    if (data.lastName !== undefined) {

        if (data.lastName.trim().length < 3) {
            throw new Error("Last Name Should Contain Minimum 3 Characters!");
        }

        if (data.lastName.trim().length > 50) {
            throw new Error("Last Name Should Be Less Than 50 Characters!");
        }
    }

    if (data.bio !== undefined) {

        if (data.bio.trim().length > 300) {
            throw new Error("Bio Cannot Exceed 300 Characters!");
        }
    }

    if (data.age !== undefined) {

        if (data.age < 5) {
            throw new Error("Invalid Age!");
        }
    }
};

module.exports={validateRegister,validateUpdateProfile};
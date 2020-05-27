module.exports={
    superadmin:{
        name:process.env.SUPERADMIN_NAME || 'admin' ,
        username:process.env.SUPERADMIN_USERNAME || 'admin' ,
        password:process.env.SUPERADMIN_PASSWORD || 'admin@123',
        email: process.env.SUPERADMIN_EMAIL ||'test@un.org'
    }
}
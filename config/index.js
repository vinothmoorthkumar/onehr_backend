module.exports={
    superadmin:{
        username:process.env.SUPERADMIN_USERNAME || 'admin' ,
        password:process.env.SUPERADMIN_PASSWORD || 'admin@123',
        email: process.env.SUPERADMIN_EMAIL ||'test@un.org'
    }
}
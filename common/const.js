
// session 的有效期时间
const SESSION_LAST = 60 * 60 * 24 * 15 * 1000;

const SALT_LENGTH = 5;



const ERROR_CODE = {
	NOT_REGISTER: 1,
	NOT_LOGIN: 2,
}




module.exports = {
	SESSION_LAST,
	SALT_LENGTH,
	ERROR_CODE,
}

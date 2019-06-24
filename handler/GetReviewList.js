const base64            = require('js-base64');


const errCode = require("../config/errCode");
const BaseClass = require("./baseClass.js");

class GetReviewList extends BaseClass{
    constructor() {
        super();
    }
    async run(ctx, next) {
        try {
	        // 检查params
	        let paramsOk = this.checkParams(['page', 'page_size', 'need_page']);
	        if (!paramsOk) {
		        return next();
	        }
	        
	        let noteArr = []
	        
	        if (this.param.need_page) {
		        let page = Number(this.param.page);
		        let pageSize = Number(this.param.page_size);
		
		        let offset = (page - 1) * pageSize;
		        let limit = pageSize;
		
		        noteArr = await this.NoteModel.getReviewList(this.uid, limit, offset);
	        } else {
		        noteArr = await this.NoteModel.getReviewList(this.uid, false);
	        }
	        
	        
	        
            if (!noteArr || !Array.isArray(noteArr)) {
                throw new Error('查询noteArr失败')
                return
            }
            ctx.body = {
                success: true,
                review_list:noteArr,
            }
            return next();
        } catch (e) {
            console.log(e);
            this.responseFail('查询noteArr失败', errCode.UPDATE_CONTNET_FAIL);
            return next();
        }
    }
}


// export { ChangeOldBlog }

module.exports = GetReviewList;

const errCode = require("../config/errCode");
const BaseClass = require('./baseClass.js');

class HasReviewThis extends BaseClass{
    constructor() {
        super();
    }

    async run(ctx, next) {
        try {
            let paramOk = this.checkParams(['note_id'])

            if (!paramOk) {
                return next();
            }
            if (typeof this.param.note_id !== 'number') {
                throw new Error('参数数据格式不正确')
            }
            // 判断该BLOG是否存在
            let blogArr =  await this.NoteModel.getArrByNoteId(this.param.note_id);

            if (blogArr.length !== 1) {
                throw new Error('该笔记在数据库中不唯一')
                return
            }

            let reviewNum = Number(blogArr[0].review_num) + 1;
            let frequency = Number(blogArr[0].frequency);
            let needReview = 1;
            let nextNotifyTime = this.getNextReviewTime(reviewNum, frequency);

            let param = {
                frequency,
                note_id: this.param.note_id,
                reviewNum,
                nextNotifyTime,
                needReview,
            }
            let updateRes = await this.NoteModel.updateBlogReviewNotice(param);
            if (!updateRes) {
                throw new Error('复习次数增加失败')
                return next();
            }
            ctx.body = {
                success:true,
                message: '复习成功',
                data: {
                    next_notify_time: nextNotifyTime,
                }
            }
            return next();
        } catch (e) {
            this.responseFail('复习次数增加失败', errCode.UPDATE_STATE_FAIL);
            return next();
        }
    }
}


// export { DeleteFile }

module.exports = HasReviewThis;

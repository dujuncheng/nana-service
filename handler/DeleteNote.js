const base64            = require('js-base64');

const errCode = require("../config/errCode");
const BaseClass = require('./baseClass.js');

class DeleteNote extends BaseClass{
    constructor() {
        super();
    }
    async run(ctx, next) {
        try {
            // TODO userid
            let paramOk = this.checkParams(['note_id'])

            if (!paramOk) {
                return next();
            }
            if (typeof this.param.note_id !== 'number') {
                throw new Error('参数数据格式不正确')
                return
            }
            // 判断该note是否存在
            let noteArr =  await this.NoteModel.getArrByNoteId(this.param.note_id);
            if (noteArr.length !== 1) {
                throw new Error('该note不唯一或不存在')
                return
            }
            let updateRes = await this.NoteModel.updateNoteState(this.param.note_id, 0);
            if (!updateRes) {
                this.responseFail('文件删除失败', errCode.UPDATE_STATE_FAIL);
                return next();
            }
            ctx.body = {
                success:true,
                message: '文件删除成功'
            }
            return next();
        } catch (e) {
            this.responseFail(e.message || '文件删除失败', errCode.UPDATE_STATE_FAIL);
            return next();
        }
    }
}


// export { DeleteFile }

module.exports = DeleteNote;

const SqlString                         = require('sqlstring');
const _                                 = require('underscore');
const xss                               = require('xss');


// webpack
// import mysql from '../../common/mysql.js';
// import {dbConf} from '../../config/db.js';

const mysql = require('../common/mysql.js');
const dbConf = require('../config/db.js');


const filteremoji = (originText) => {
    if (_.isUndefined(originText) || typeof originText !== 'string') {
        return originText;
    }
    let ranges = [
        '\ud83c[\udf00-\udfff]',
        '\ud83d[\udc00-\ude4f]',
        '\ud83d[\ude80-\udeff]',
    ];
    let newText = originText.replace(new RegExp(ranges.join('|'), 'g'), '');
    return newText;
};

class NoteModel {
    constructor() {}

    static instance() {
        const clazz = 'NoteModel';
        if (!NoteModel.instances[clazz]) {
            NoteModel.instances[clazz] = new this();
        }
        return NoteModel.instances[clazz];

    }

    filter(str) {
        if (_.isUndefined(str)) {
            return false;
        }
        let result = str;

        result = filteremoji(result);
        result = SqlString.format(result);
        result = xss(result);

        return result;
    }

    /**
     *  增加一条笔记的记录
     * @param fileName
     * @param filePath
     * @param notifyTime
     * @param content
     * @returns {Promise<T>}
     */
    async addNewNote(
        note_id,
        user_id,
        catalog_id,
        title,
        content,
        notify_time,
    ) {
        if (
            _.isUndefined(note_id) ||
            _.isUndefined(user_id) ||
            _.isUndefined(catalog_id) ||
            _.isUndefined(notify_time)

        ) {
            throw new Error('写入数据库参数缺失');
        }

        if (!title) {
            title = '';
        }

        if (!content) {
            content = '';
        }

        let fieldStr = dbConf.noteTableField.join(',');

        let valueArr = [];
        valueArr.push(0);
        valueArr.push(note_id);
        valueArr.push(user_id);
        valueArr.push(catalog_id);
        valueArr.push(title);
        valueArr.push(content);
        valueArr.push(notify_time);
        valueArr.push(0);
        valueArr.push(1);
        valueArr.push(Date.now() / 1000);
        valueArr.push(Date.now() / 1000);


        const sql = `INSERT INTO note_table (${fieldStr}) VALUES (?,?,?,?,?,?,?,?,?,?,?)`;
        let result = await mysql.bindSql(sql, valueArr, dbConf.dbName);
        return result;
    }


    /**
     *
     * @param birthTime
     * @param content
     * @returns {Promise<*>}
     */
    async updateBlogContent(birthTime, content) {
        if(_.isUndefined(content) || _.isUndefined(birthTime)) {
            return false;
        }
        let sql = `UPDATE note_table
                SET
                content = '${content}',
                is_changed = '1',
                gmt_modify = '${new Date().getTime() / 1000}'
                WHERE birth_time = '${birthTime}'`;

        let res = await mysql.runSql(sql, dbConf.dbName)
            .catch((err) => {
                console.log(err);
            });
        return res;
    }

    /**
     * 更新note的状态
     * @param note_id
     * @param state
     * @returns {Promise<*>}
     */
    async updateNoteState(note_id, state) {
        if(_.isUndefined(note_id) || _.isUndefined(state)) {
            return false;
        }
        let sql = `UPDATE note_table
                SET
                state = '${state}',
                gmt_modify = '${new Date().getTime() / 1000}'
                WHERE note_id = '${note_id}'`;

        let res = await mysql.runSql(sql, dbConf.dbName)
            .catch((err) => {
                console.log(err);
            });
        return res;
    }

    /**
     * 过滤 xss
     * @param str
     * @returns {*}
     */
    filter(str) {
        if (_.isUndefined(str)) {
            return false;
        }
        let result = str;

        result = filteremoji(result);
        result = SqlString.format(result);
        result = SqlString.escape(result);
        result = xss(result);

        return result;
    }

    /**
     * 根据path来查找数据
     * @param birthTime
     * @returns {Promise<T>}
     */
    async getBlogArrByFilePath(path) {
        if (_.isUndefined(path)) {
            throw new Error('读取数据库参数缺失');
        }
        let sql = `SELECT * FROM note_table WHERE file_path = '${path}'`;

        let res = await mysql.runSql(sql, dbConf.dbName)
            .catch((err) => {
                console.log(err);
            });
        return res;
    }

    /**
     * 根据catalog_id 来查找数据
     * @param catalog_id
     * @returns {Promise<T>}
     */
    async getArrByCatalogId(catalog_id, user_id) {
        if (_.isUndefined(catalog_id) || _.isUndefined(user_id)) {
            throw new Error('读取数据库参数缺失');
        }
        let sql = `SELECT * FROM note_table WHERE 
        catalog_id = '${catalog_id}' 
        AND 
        user_id = ${user_id}
        AND
        state = 1
        ORDER BY id DESC
        `;

        let res = await mysql.runSql(sql, dbConf.dbName)
            .catch((err) => {
                console.log(err);
            });
        return res;
    }

    /**
     * 根据note_id 来查找数据
     * @param birthTime
     * @returns {Promise<T>}
     */
    async getArrByNoteId(note_id) {
        if (_.isUndefined(note_id)) {
            throw new Error('读取数据库参数缺失');
        }
        let sql = `SELECT * FROM note_table WHERE note_id = '${note_id}' AND state = 1`;

        let res = await mysql.runSql(sql, dbConf.dbName)
            .catch((err) => {
                console.log(err);
            });
        return res;
    }

    async updateBlogReviewNotice(birthTime, nextNotifyTime, reviewNum) {
        if(_.isUndefined(birthTime) || _.isUndefined(nextNotifyTime) || _.isUndefined(reviewNum)) {
            return false;
        }
        let sql = `UPDATE note_table
                SET
                notify_time = '${nextNotifyTime}',
                has_review = '${reviewNum}',
                gmt_modify = '${new Date().getTime() / 1000}'
                WHERE birth_time = '${birthTime}'`;

        let res = await mysql.runSql(sql, dbConf.dbName)
            .catch((err) => {
                console.log(err);
            });
        return res;
    }

    async getAllBlogArr() {
        let sql = `SELECT * FROM note_table WHERE state = 1 ORDER BY notify_time`;

        let res = await mysql.runSql(sql, dbConf.dbName)
            .catch((err) => {
                console.log(err);
            });
        return res;
    }
}

NoteModel.instances = {};

module.exports = NoteModel;

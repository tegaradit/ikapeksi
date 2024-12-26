const pool = require('../config/db')

exports.textarea = async function (req, res) {
    try {
        const { textarea } = req.body
        const query = `UPDATE configid SET text_area = ? WHERE id = ?`
        const values = [textarea, 1]
        const [rows] = await pool.execute(query, values)
        res.status(200).json({
            message: 'Textarea updated successfully',
            data : rows
        })
    } catch (eror) {
        console.log(eror)
        res.status(500).json({message: 'Error updating config'})
    }
}

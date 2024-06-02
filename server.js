const express = require('express');
const axios = require('axios');
const cors = require('cors'); // 引入CORS包
const app = express();
const PORT = process.env.PORT || 3000;

// 替换为你的 GitHub 个人访问令牌
const GITHUB_TOKEN = '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';

// 使用CORS中间件
app.use(cors());
app.use(express.json());

// 修复 Authorization 头部的格式
app.get('/get-contract', async (req, res) => {
    const { contractNumber } = req.query;

    try {
        const response = await axios.get('https://api.github.com/repos/nm594188/contract-signature/issues', {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`
            }
        });

        const issues = response.data;
        const contractIssue = issues.find(issue => issue.body.includes(contractNumber));

        if (contractIssue) {
            res.json({
                contractNumber: contractNumber,
                content: contractIssue.body
            });
        } else {
            res.status(404).send('Contract not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// 新增保存签名的路由
app.post('/save-signature', async (req, res) => {
    const { signature, contractNumber, partyB1, partyB2, date } = req.body;

    const bodyContent = `
        Date: ${date}
        Contract Number: ${contractNumber}
        Party B1: ${partyB1}
        Party B2: ${partyB2}
        Signature: ${signature}
    `;

    try {
        const response = await axios.post('https://api.github.com/repos/nm594188/contract-signature/issues', {
            title: `New Signature - ${contractNumber}`,
            body: bodyContent
        }, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        res.json({ message: '签名保存成功', issueUrl: response.data.html_url });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

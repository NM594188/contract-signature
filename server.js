const express = require('express');
const axios = require('axios');
const cors = require('cors'); // ����CORS��
const app = express();
const PORT = process.env.PORT || 3000;

// �滻Ϊ��� GitHub ���˷�������
const GITHUB_TOKEN = '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';

// ʹ��CORS�м��
app.use(cors());
app.use(express.json());

// �޸� Authorization ͷ���ĸ�ʽ
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

// ��������ǩ����·��
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

        res.json({ message: 'ǩ������ɹ�', issueUrl: response.data.html_url });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

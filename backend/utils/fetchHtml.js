import axios from 'axios';

const fetchHtml = async (url) => {
    try {
        const response = await axios.get(url, {
            timeout: 10000,
            headers: {
                'User-Agent': 'Accessibility-Analyzer/1.0 (Web Accessibility Testing Tool)'
            },
            maxRedirects: 5,
            validateStatus: (status) => status >= 200 && status < 400
        });

        return response.data;
    } catch (error) {
        if (error.code === 'ENOTFOUND') {
            throw new Error(`Domain not found: ${url}`);
        } else if (error.code === 'ECONNREFUSED') {
            throw new Error(`Connection refused to: ${url}`);
        } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
            throw new Error(`Request timeout for: ${url}`);
        } else if (error.response) {
            throw new Error(`HTTP ${error.response.status}: ${error.response.statusText}`);
        }
        throw new Error(`Failed to fetch URL: ${error.message}`);
    }
};

export default fetchHtml;
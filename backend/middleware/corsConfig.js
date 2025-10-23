const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
    
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://127.0.0.1:3000',
            'http://localhost:5173',
            process.env.CORS_ORIGIN
            ].filter(Boolean);

        if(allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

export default corsOptions;

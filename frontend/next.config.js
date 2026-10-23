/** @type {import('next').NextConfig} */
const nextConfig = {}

module.exports = {
    typescript: {
        // Только для deploy/laptop/package-for-laptop.ps1. Обычная сборка по-прежнему проверяет типы.
        ignoreBuildErrors: process.env.LAPTOP_PACKAGE_BUILD === '1',
    },
    // NEXT_PUBLIC_* подставляется при next build; задайте NEXT_PUBLIC_DOMAIN в .env.production на сервере перед сборкой.
    env: {
        NEXT_PUBLIC_DOMAIN:
            process.env.NEXT_PUBLIC_DOMAIN ||
            (process.env.NODE_ENV === 'production'
                ? 'http://localhost:7008'
                : 'http://localhost:7008'),
    },
    images: {
        // Обновлено для Next.js 16 - используем remotePatterns вместо domains
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'mebers.kord.uz',
                pathname: '/api/upload/image/**',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '7008',
                pathname: '/api/upload/image/**',
            },
            {
                protocol: 'http',
                hostname: '127.0.0.1',
                port: '7008',
                pathname: '/api/upload/image/**',
            },
        ],
    },
    // В Next.js 16 Server Actions включены по умолчанию
    // Настраиваем их для безопасности
    experimental: {
        serverActions: {
            allowedOrigins: [],
        },
    },
    reactStrictMode: true,
    turbopack: {},
    webpack(config, options) {
        // Блокируем выполнение shell команд во время сборки
        config.resolve.fallback = {
            ...config.resolve.fallback,
            child_process: false,
            fs: false,
        };
        
        config.module.rules.push({
            loader: '@svgr/webpack',
            issuer: /\.[jt]sx?$/,
            options: {
                prettier: false,
                svgo: true,
                svgoConfig: {
                    plugins: [
                        {
                            name: 'preset-default',
                            params: {
                                overrides: {
                                    removeViewBox: false,
                                },
                            },
                        }
                    ],
                },
                titleProp: true,
            },
            test: /\.svg$/,
        });

        return config;
    },
};

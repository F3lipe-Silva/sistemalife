/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Adicionado para corrigir o erro 'require.extensions is not supported by webpack'
    // que vem da dependência 'handlebars' no genkit.
    // Isto diz ao webpack para não empacotar o 'handlebars' no lado do servidor.
    if (isServer) {
      config.externals = [...config.externals, 'handlebars'];
    }

    // Fix for Ionic React with Next.js
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };

    // Ensure Ionic React is properly transpiled
    config.module.rules.push({
      test: /\.m?js$/,
      include: /node_modules\/@ionic/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env', '@babel/preset-react'],
          plugins: ['@babel/plugin-transform-runtime'],
        },
      },
    });

    return config;
  },
  transpilePackages: ['@ionic/react'],
};

export default nextConfig;
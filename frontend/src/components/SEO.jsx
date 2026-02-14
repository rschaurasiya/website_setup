import React from 'react';
import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';

const SEO = ({ title, description, keywords, image, url, type = 'website' }) => {
    const siteTitle = 'Legal Blog Platform';
    const defaultDescription = 'Decoding the Law, Simplifying Justice. A dedicated platform for law students and professionals.';
    const defaultImage = 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80';
    const siteUrl = import.meta.env.VITE_CLIENT_URL || 'http://localhost:5173';

    const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
    const fullUrl = url ? `${siteUrl}${url}` : siteUrl;

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{fullTitle}</title>
            <meta name="description" content={description || defaultDescription} />
            <meta name="keywords" content={keywords || 'law, legal, justice, blog, articles'} />
            <link rel="canonical" href={fullUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={title || siteTitle} />
            <meta property="og:description" content={description || defaultDescription} />
            <meta property="og:image" content={image || defaultImage} />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:site_name" content={siteTitle} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title || siteTitle} />
            <meta name="twitter:description" content={description || defaultDescription} />
            <meta name="twitter:image" content={image || defaultImage} />
        </Helmet>
    );
};

SEO.propTypes = {
    title: PropTypes.string,
    description: PropTypes.string,
    keywords: PropTypes.string,
    image: PropTypes.string,
    url: PropTypes.string,
    type: PropTypes.string
};

export default SEO;

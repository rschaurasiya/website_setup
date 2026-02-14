import React from 'react';
import { Link } from 'react-router-dom';
import { Users, PenTool, TrendingUp, Scale, Gavel, FileText, ArrowRight } from 'lucide-react';

const ExploreCard = ({ icon: Icon, title, description, link }) => (
    <Link to={link} className="group h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none hover:border-primary-500/50 dark:hover:border-primary-500/50 hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary-50 dark:group-hover:bg-slate-800 transition-all duration-300 border border-slate-100 dark:border-slate-700 group-hover:border-primary-100 dark:group-hover:border-primary-900/30">
            <Icon className="w-9 h-9 text-slate-700 dark:text-slate-300 group-hover:text-primary-600 dark:group-hover:text-amber-400 transition-colors duration-300" />
        </div>

        <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-white mb-3 group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">{title}</h3>

        <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-relaxed flex-grow">
            {description}
        </p>

        <span className="inline-flex items-center text-sm font-bold text-slate-900 dark:text-slate-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            Explore
            <ArrowRight className="w-4 h-4 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
        </span>
    </Link>
);

const ExploreSection = () => {
    const categories = [
        {
            icon: Users,
            title: "Our Team",
            description: "Meet the dedicated legal minds and authors behind LawBlog.",
            link: "/our-team"
        },
        {
            icon: PenTool,
            title: "Authors",
            description: "Discover the experts contributing to our legal insights.",
            link: "/authors"
        },
        {
            icon: TrendingUp,
            title: "Popular Blogs",
            description: "Browse the most read and discussed legal articles.",
            link: "/blogs?sort=popular"
        },
        {
            icon: Scale,
            title: "Case Briefs",
            description: "Concise summaries of landmark judgments and key takeaways.",
            link: "/blogs?category=case-briefs"
        },
        {
            icon: Gavel,
            title: "Know The Law",
            description: "Simplified explanations of complex legal concepts and statutes.",
            link: "/blogs?category=know-the-law"
        },
        {
            icon: FileText,
            title: "Topics",
            description: "Browse articles categorized by legal domains and subjects.",
            link: "/topics"
        }
    ];

    return (
        <section className="py-24 bg-slate-50 dark:bg-slate-950 relative">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent"></div>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <span className="text-primary-600 dark:text-primary-400 font-semibold tracking-wider uppercase text-sm mb-3 block">Discover Content</span>
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 dark:text-white mb-6">Explore Our Platform</h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                        Navigate through our comprehensive collection of legal resources, from expert analysis to case summaries.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {categories.map((category, index) => (
                        <ExploreCard key={index} {...category} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ExploreSection;

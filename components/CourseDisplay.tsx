import React, { useRef, useState, useEffect } from 'react';
import type { Course } from '../types';
import { Download, FileText, FileImage, Presentation, GraduationCap, BookOpen, Code, X, List, Network } from './icons';
import { generatePracticeCode, generateMicroLessonSummary } from '../services/geminiService';

// @ts-ignore
const { jsPDF } = window.jspdf;
// @ts-ignore
const pptxgen = window.pptxgen;

const DownloadButton: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; }> = ({ icon, label, onClick }) => (
    <button
        onClick={onClick}
        className="flex flex-col items-center justify-center gap-2 bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-gray-300 hover:bg-cyan-500/20 hover:text-cyan-400 hover:border-cyan-500 transition-all duration-300"
    >
        {icon}
        <span className="text-sm font-medium">{label}</span>
    </button>
);

const CertificateModal: React.FC<{ courseTitle: string, onClose: () => void }> = ({ courseTitle, onClose }) => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center" onClick={onClose}>
        <div className="relative bg-gray-900 border-4 border-cyan-400 p-10 w-full max-w-4xl aspect-[1.414] rounded-lg shadow-2xl shadow-cyan-500/50 flex flex-col items-center justify-center text-center" onClick={e => e.stopPropagation()}>
            <div className="absolute inset-0 bg-grid-cyan-500/[0.2] [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>
            <p className="text-2xl text-gray-300 font-serif mb-4">Certificate of Completion</p>
            <h1 className="text-5xl font-bold text-cyan-400 mb-2" style={{ textShadow: '0 0 8px #06b6d4' }}>{courseTitle}</h1>
            <p className="text-xl text-gray-400 mb-8">This certificate is awarded to</p>
            <p className="text-4xl font-semibold text-white tracking-wider border-b-2 border-fuchsia-500 pb-2 px-8">Valued User</p>
            <p className="text-lg text-gray-400 mt-8">For successfully generating and completing the course materials.</p>
            <div className="absolute bottom-10 left-10 text-left">
                <p className="text-sm text-gray-500">Date Issued:</p>
                <p className="text-lg text-gray-300">{new Date().toLocaleDateString()}</p>
            </div>
            <div className="absolute bottom-10 right-10">
                <GraduationCap className="w-20 h-20 text-cyan-400 opacity-50" />
            </div>
        </div>
    </div>
);

const PracticeCodeModal: React.FC<{ code: string; error: string | null; isLoading: boolean; onClose: () => void; }> = ({ code, error, isLoading, onClose }) => {
    const [copyText, setCopyText] = useState('Copy Code');
    const [editedCode, setEditedCode] = useState('');

    useEffect(() => {
        setEditedCode(code);
    }, [code]);

    const handleCopy = () => {
        navigator.clipboard.writeText(editedCode);
        setCopyText('Copied!');
        setTimeout(() => setCopyText('Copy Code'), 2000);
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex-grow flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-fuchsia-500"></div>
                </div>
            );
        }
        if (error) {
            return <div className="text-red-400 bg-red-900/50 border border-red-500/50 p-4 rounded-md">{error}</div>;
        }
        return (
            <div className="flex-grow bg-gray-950 rounded-md relative flex flex-col group">
                <textarea
                    value={editedCode}
                    onChange={(e) => setEditedCode(e.target.value)}
                    className="flex-grow w-full bg-transparent text-gray-300 text-sm font-mono resize-none focus:outline-none p-4"
                    spellCheck="false"
                />
                <button onClick={handleCopy} className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {copyText}
                </button>
                 <p className="text-xs text-gray-500 p-2 text-center">This is a practice area. Code execution is not supported.</p>
            </div>
        );
    };

    return (
         <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="relative bg-gray-900 border border-fuchsia-500/50 rounded-lg p-6 w-full max-w-2xl flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-white">Practice Code</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                {renderContent()}
            </div>
        </div>
    );
};

const MicroLessonModal: React.FC<{ 
    course: Course; 
    data: { summary: string; diagram: string } | null; 
    error: string | null; 
    isLoading: boolean; 
    onClose: () => void; 
}> = ({ course, data, error, isLoading, onClose }) => {
    
    const handleDownload = () => {
        if (!data) return;

        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'pt',
            format: 'a4'
        });

        const margin = 40;
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const usableWidth = pageWidth - margin * 2;
        let yPos = margin;

        // Theme colors
        const darkBgColor = '#1f2937'; // gray-800
        const lightTextColor = '#d1d5db'; // gray-300
        const cyanColor = '#06b6d4';
        const fuchsiaColor = '#c026d3';
        const diagramTextColor = '#9ca3af'; // gray-400

        // Function to add background to a page
        const addPageBackground = () => {
            pdf.setFillColor(darkBgColor);
            pdf.rect(0, 0, pageWidth, pageHeight, 'F');
        };

        addPageBackground(); // Add to the first page

        const checkPageBreak = (neededHeight: number) => {
            if (yPos + neededHeight > pageHeight - margin) {
                pdf.addPage();
                addPageBackground(); // Add background to new pages
                yPos = margin;
            }
        };

        // Main Title
        pdf.setFontSize(22);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(cyanColor);
        pdf.text(course.title, pageWidth / 2, yPos, { align: 'center' });
        yPos += 20;
        pdf.setFontSize(14);
        pdf.setTextColor(lightTextColor);
        pdf.text("Micro-Lesson Report", pageWidth / 2, yPos, { align: 'center' });
        yPos += 40;

        // Summary
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(fuchsiaColor);
        pdf.text("Course Summary", margin, yPos);
        yPos += 20;
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(lightTextColor);
        const summaryLines = pdf.splitTextToSize(data.summary, usableWidth);
        checkPageBreak(summaryLines.length * 12);
        pdf.text(summaryLines, margin, yPos);
        yPos += summaryLines.length * 12 + 30;

        // Diagram
        checkPageBreak(80);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(fuchsiaColor);
        pdf.text("Course Flow Diagram", margin, yPos);
        yPos += 20;
        pdf.setFont('courier', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(diagramTextColor);
        const diagramLines = data.diagram.split('\n');
        checkPageBreak(diagramLines.length * 10);
        pdf.text(diagramLines, margin, yPos);
        yPos += diagramLines.length * 10 + 30;

        // Lessons & Activities
        checkPageBreak(40);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(fuchsiaColor);
        pdf.text("Lessons & Activities", margin, yPos);
        yPos += 25;

        course.modules.forEach(module => {
            checkPageBreak(30);
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(cyanColor);
            pdf.text(`Module: ${module.title}`, margin, yPos);
            yPos += 20;

            module.lessons.forEach(lesson => {
                const lessonText = `- ${lesson.title}: ${lesson.activity}`;
                const lessonLines = pdf.splitTextToSize(lessonText, usableWidth - 15);
                
                checkPageBreak(lessonLines.length * 12 + 5);

                pdf.setFontSize(10);
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(lightTextColor);
                pdf.text(lessonLines, margin + 15, yPos);
                yPos += lessonLines.length * 12 + 10;
            });
            yPos += 15;
        });

        pdf.save(`${course.title} - Micro Lessons Report.pdf`);
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex-grow flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-cyan-500"></div>
                     <p className="ml-4 text-cyan-400">AI is summarizing...</p>
                </div>
            );
        }
        if (error) {
            return <div className="text-red-400 bg-red-900/50 border border-red-500/50 p-4 rounded-md">{error}</div>;
        }
        if (data) {
            return (
                <div className="space-y-6 text-gray-300">
                    <div>
                        <h3 className="text-lg font-semibold text-cyan-400 mb-2">Course Summary</h3>
                        <p className="bg-gray-800 p-3 rounded-md border border-gray-700">{data.summary}</p>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-cyan-400 mb-2 flex items-center gap-2"><Network className="w-5 h-5" /> Course Flow</h3>
                        <pre className="bg-gray-950 p-4 rounded-md border border-gray-700 text-sm font-mono overflow-x-auto">{data.diagram}</pre>
                    </div>
                    <button onClick={handleDownload} className="w-full bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-700 transition-colors shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2">
                        <Download className="w-5 h-5" /> Download PDF Report
                    </button>
                </div>
            );
        }
        return null;
    };

    return (
         <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="relative bg-gray-900 border border-cyan-500/50 rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-white">Micro-Lesson Overview</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                {renderContent()}
            </div>
        </div>
    );
};


export const CourseDisplay: React.FC<{ course: Course; onCreateNew: () => void; }> = ({ course, onCreateNew }) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const [showCertificateModal, setShowCertificateModal] = useState(false);
    
    const [showCodeModal, setShowCodeModal] = useState(false);
    const [practiceCode, setPracticeCode] = useState<string>('');
    const [loadingDifficulty, setLoadingDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | null>(null);
    const [codeError, setCodeError] = useState<string | null>(null);
    
    const [showMicroLessonModal, setShowMicroLessonModal] = useState(false);
    const [microLessonData, setMicroLessonData] = useState<{ summary: string; diagram: string } | null>(null);
    const [isMicroLessonLoading, setIsMicroLessonLoading] = useState(false);
    const [microLessonError, setMicroLessonError] = useState<string | null>(null);


    const handleGenerateCode = async (difficulty: 'Easy' | 'Medium' | 'Hard') => {
        setLoadingDifficulty(difficulty);
        setCodeError(null);
        setShowCodeModal(true);
        try {
            const code = await generatePracticeCode(course.title, difficulty);
            setPracticeCode(code);
        } catch (err: any) {
            setCodeError(err.message || 'An unknown error occurred.');
            setPracticeCode('');
        } finally {
            setLoadingDifficulty(null);
        }
    }

    const handleGenerateMicroLessons = async () => {
        setShowMicroLessonModal(true);
        if(microLessonData) return; // Don't re-fetch if data is already there
        
        setIsMicroLessonLoading(true);
        setMicroLessonError(null);
        try {
            const data = await generateMicroLessonSummary(course); 
            setMicroLessonData(data);
        } catch (err: any) {
            setMicroLessonError(err.message || 'Failed to generate summary.');
        } finally {
            setIsMicroLessonLoading(false);
        }
    };


    const handleDownload = async (format: 'pdf' | 'png' | 'txt' | 'pptx') => {
        if (!contentRef.current) return;
        const content = contentRef.current;

        switch (format) {
            case 'png': {
                // @ts-ignore
                const canvas = await html2canvas(content, { backgroundColor: '#111827' });
                const link = document.createElement('a');
                link.download = `${course.title}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
                break;
            }
            case 'pdf': {
                 // @ts-ignore
                const canvas = await html2canvas(content, { backgroundColor: '#111827', scale: 2 });
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF({
                    orientation: 'p',
                    unit: 'px',
                    format: [canvas.width, canvas.height]
                });
                pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
                pdf.save(`${course.title}.pdf`);
                break;
            }
            case 'txt': {
                let textContent = `Course: ${course.title}\n\nDescription: ${course.description}\n\n`;
                course.modules.forEach(module => {
                    textContent += `--- MODULE: ${module.title} ---\n\n`;
                    module.lessons.forEach(lesson => {
                        textContent += `Lesson: ${lesson.title}\n`;
                        textContent += `Content: ${lesson.content}\n`;
                        if (lesson.codeExample) {
                            textContent += `Code Example:\n${lesson.codeExample}\n`;
                        }
                        textContent += `Activity: ${lesson.activity}\n\n`;
                    });
                });
                const blob = new Blob([textContent], { type: 'text/plain' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `${course.title}.txt`;
                link.click();
                break;
            }
            case 'pptx': {
                const ppt = new pptxgen();
                ppt.layout = 'LAYOUT_WIDE';
                
                // Define theme colors
                const darkBgColor = '1F2937'; 
                const textColor = 'F1F5F9'; 
                const titleColor = '22D3EE'; 
                const headingColor = 'D946EF';

                // Set a default master slide with a dark background
                ppt.defineLayout({
                    name: 'MASTER_DARK',
                    background: { color: darkBgColor },
                });
                ppt.layout = 'MASTER_DARK';

                // Title Slide
                const titleSlide = ppt.addSlide();
                titleSlide.addText(course.title, { 
                    x: 0.5, y: 2.5, w: '90%', h: 1, 
                    fontSize: 44, bold: true, align: 'center', 
                    color: titleColor 
                });
                titleSlide.addText(course.description, { 
                    x: 0.5, y: 3.5, w: '90%', h: 1, 
                    fontSize: 18, align: 'center', 
                    color: textColor 
                });

                // Content Slides
                course.modules.forEach(module => {
                    module.lessons.forEach(lesson => {
                        const slide = ppt.addSlide();
                        
                        slide.addText(`Module: ${module.title}`, {
                            x: 0.5, y: 0.25, w: '90%', h: 0.5,
                            fontSize: 14,
                            color: headingColor,
                            bold: true,
                        });

                        slide.addText(lesson.title, { 
                            x: 0.5, y: 0.75, w: '90%', h: 1, 
                            fontSize: 28, bold: true, 
                            color: titleColor
                        });

                        slide.addText(lesson.content, { 
                            x: 0.5, y: 2.0, w: '45%', h: 2.5, 
                            fontSize: 12, 
                            color: textColor 
                        });

                        slide.addText("Activity: " + lesson.activity, { 
                            x: 5.5, y: 2.0, w: '40%', h: 1.0, 
                            fontSize: 14, 
                            color: textColor,
                            bold: true,
                        });

                        if (lesson.codeExample) {
                             slide.addText(lesson.codeExample, {
                                x: 5.5, y: 3.2, w: '40%', h: 1.5,
                                fontFace: 'Courier New',
                                fontSize: 10,
                                color: textColor,
                                fill: { color: '030712' }, 
                                margin: 5,
                             });
                        }
                    });
                });

                ppt.writeFile({ fileName: `${course.title}.pptx` });
                break;
            }
        }
    };


    return (
        <>
            <div className="container mx-auto px-6 py-12 text-white">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-extrabold" style={{ textShadow: '0 0 10px #06b6d4' }}>
                        {course.title}
                    </h1>
                    <button onClick={onCreateNew} className="bg-fuchsia-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-fuchsia-700 transition-colors shadow-lg shadow-fuchsia-600/30">
                        Create New Course
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Panel: Course Content */}
                    <div ref={contentRef} className="md:col-span-2 bg-gray-900/50 border border-gray-700 rounded-lg p-6">
                        <p className="text-gray-400 mb-8 italic border-l-4 border-cyan-500 pl-4">{course.description}</p>
                        
                        <div className="space-y-8">
                            {course.modules.map((module, moduleIndex) => (
                                <div key={moduleIndex}>
                                    <h2 className="text-3xl font-bold text-cyan-400 mb-4 border-b-2 border-cyan-500/30 pb-2">{module.title}</h2>
                                    <div className="space-y-6">
                                        {module.lessons.map((lesson, lessonIndex) => (
                                            <div key={lessonIndex} className="bg-gray-800/60 p-4 rounded-lg border border-gray-700">
                                                <h3 className="text-xl font-semibold text-white mb-2">{lesson.title}</h3>
                                                <p className="text-gray-300 mb-3">{lesson.content}</p>
                                                {lesson.codeExample && (
                                                    <div className="mb-3">
                                                        <p className="text-sm font-semibold text-gray-400 mb-1">Code Example:</p>
                                                        <pre className="bg-gray-900 text-sm text-cyan-300 p-3 rounded-md overflow-x-auto"><code>{lesson.codeExample}</code></pre>
                                                    </div>
                                                )}
                                                <div className="bg-cyan-900/50 border border-cyan-700 p-3 rounded-md">
                                                    <h4 className="font-semibold text-cyan-300 mb-1">Activity</h4>
                                                    <p className="text-cyan-200 text-sm">{lesson.activity}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Panel: Actions */}
                    <div className="space-y-6">
                        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Download className="w-6 h-6 text-fuchsia-400"/> Download Course</h3>
                            <div className="grid grid-cols-2 gap-4">
                               <DownloadButton icon={<FileImage className="w-8 h-8"/>} label="Image (PNG)" onClick={() => handleDownload('png')} />
                               <DownloadButton icon={<FileText className="w-8 h-8"/>} label="PDF Document" onClick={() => handleDownload('pdf')} />
                               <DownloadButton icon={<FileText className="w-8 h-8"/>} label="Text Document" onClick={() => handleDownload('txt')} />
                               <DownloadButton icon={<Presentation className="w-8 h-8"/>} label="Presentation" onClick={() => handleDownload('pptx')} />
                            </div>
                        </div>

                         <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><BookOpen className="w-6 h-6 text-fuchsia-400"/> Micro Lessons</h3>
                             <button onClick={handleGenerateMicroLessons} className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                                <List className="w-5 h-5"/> View Summary
                            </button>
                        </div>

                        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Code className="w-6 h-6 text-fuchsia-400"/> Practice Zone</h3>
                            <div className="space-y-3">
                                <button onClick={() => handleGenerateCode('Easy')} className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">Easy Example</button>
                                <button onClick={() => handleGenerateCode('Medium')} className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">Medium Example</button>
                                <button onClick={() => handleGenerateCode('Hard')} className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">Hard Example</button>
                            </div>
                        </div>

                        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 text-center">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2 justify-center"><GraduationCap className="w-6 h-6 text-fuchsia-400"/> Course Complete?</h3>
                            <button 
                                onClick={() => setShowCertificateModal(true)}
                                className="w-full bg-fuchsia-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-fuchsia-700 transition-colors shadow-lg shadow-fuchsia-600/30">
                                Get Certificate
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {showCertificateModal && <CertificateModal courseTitle={course.title} onClose={() => setShowCertificateModal(false)} />}
            
            {showCodeModal && <PracticeCodeModal 
                code={practiceCode} 
                error={codeError} 
                isLoading={loadingDifficulty !== null} 
                onClose={() => setShowCodeModal(false)} 
            />}

            {showMicroLessonModal && <MicroLessonModal 
                course={course}
                data={microLessonData}
                error={microLessonError}
                isLoading={isMicroLessonLoading}
                onClose={() => setShowMicroLessonModal(false)}
            />}

        </>
    );
};

"use client";

import { useState } from "react";
import Image from "next/image";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

export default function Home() {
    const [file, setFile] = useState(null);
    const [analysisResult, setAnalysisResult] = useState<{
        analysis: string;
    } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleFileChange = (event: any) => {
        setFile(event.target.files[0]);
    };

    const handleAnalyze = async () => {
        if (!file) {
            alert("Please upload a file first.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        setIsLoading(true);
        try {
            const response = await fetch("/api/analyze", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Failed to analyze file");
            }

            const result = await response.json();
            setAnalysisResult(result);
        } catch (error) {
            console.error(error);
            alert("An error occurred while analyzing the file.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center p-8">
            <header className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-800">
                    Skill Assessment Tool
                </h1>
                <p className="text-gray-600 mt-2">
                    Upload a PDF to analyze skills and get recommendations.
                </p>
            </header>

            <main className="bg-white shadow-md rounded-lg p-6 w-full max-w-lg">
                <div className="mb-4">
                    <input
                        type="file"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
                    />
                </div>
                <button
                    onClick={handleAnalyze}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                            <AiOutlineLoading3Quarters className="animate-spin" />
                            Analyzing...
                        </div>
                    ) : (
                        "Analyze File"
                    )}
                </button>

                {analysisResult && (
                    <div className="mt-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            Analysis Result
                        </h2>
                        <div className="space-y-4">
                            <p className="text-gray-700 whitespace-pre-line">
                                {analysisResult.analysis
                                    .split("\n\n")
                                    .filter(
                                        (paragraph, index, array) =>
                                            index !== 0 &&
                                            index !== array.length - 1
                                    )
                                    .join("\n\n")}
                            </p>
                        </div>
                    </div>
                )}
            </main>

            <footer className="mt-8 text-center text-gray-500 text-sm">
                Built with Next.js, Tailwind CSS, and OpenAI API
            </footer>
        </div>
    );
}

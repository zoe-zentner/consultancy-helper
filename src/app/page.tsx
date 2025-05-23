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

            <main className="bg-white shadow-md rounded-lg p-6 w-full max-w-4xl">
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
                    <div className="mt-6 overflow-x-auto">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            Analysis Result
                        </h2>
                        <div className="space-y-4">
                            <div className="whitespace-normal">
                                <table className="w-full border-collapse border border-gray-300">
                                    <thead>
                                        <tr>
                                            <th className="border border-gray-300 px-4 py-3 text-center bg-gray-50 font-semibold"></th>
                                            <th className="border border-gray-300 px-4 py-3 text-center bg-gray-50 font-semibold">Initial</th>
                                            <th className="border border-gray-300 px-4 py-3 text-center bg-gray-50 font-semibold">Repeatable</th>
                                            <th className="border border-gray-300 px-4 py-3 text-center bg-gray-50 font-semibold">Defined</th>
                                            <th className="border border-gray-300 px-4 py-3 text-center bg-gray-50 font-semibold">Managed</th>
                                            <th className="border border-gray-300 px-4 py-3 text-center bg-gray-50 font-semibold">Optimizing</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {analysisResult.analysis
                                            .split("### ")
                                            .filter(section => section.match(/^\d+\./))
                                            .map((section, index) => {
                                                const lines = section
                                                    .split("\n")
                                                    .filter(
                                                        (line) =>
                                                            line.trim() !== "" &&
                                                            !line.includes("Current Status") &&
                                                            !line.includes("Goals") &&
                                                            !line.includes("Summary") &&
                                                            !line.includes("Categories and Levels of Completion")
                                                    );

                                                const categoryMatch = lines[0].match(/^\d+\.\s*\*\*(.*?)\*\*/);
                                                const category = categoryMatch ? categoryMatch[1].trim() : "Unknown Category";
                                                
                                                const levels = lines
                                                    .filter(line => 
                                                        line.includes("**Initial**") || 
                                                        line.includes("**Repeatable**") || 
                                                        line.includes("**Defined**") || 
                                                        line.includes("**Managed**") || 
                                                        line.includes("**Optimizing**")
                                                    )
                                                    .map((line) => {
                                                        const match = line.match(/-\s*\*\*(.*?)\*\*:\s*(.*)/);
                                                        return match
                                                            ? {
                                                                  level: match[1].trim(),
                                                                  description: match[2].trim(),
                                                              }
                                                            : null;
                                                    })
                                                    .filter(Boolean);

                                                return (
                                                    <tr key={index}>
                                                        <td className="border border-gray-300 px-4 py-3 font-semibold text-center whitespace-normal">
                                                            {category}
                                                        </td>
                                                        {levels.map((level, levelIndex) => (
                                                            <td
                                                                key={levelIndex}
                                                                className="border border-gray-300 px-4 py-3 whitespace-normal"
                                                            >
                                                                {level?.description}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                );
                                            })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {analysisResult && (
                    <div className="mt-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            Raw Response
                        </h2>
                        <pre className="bg-gray-100 p-4 rounded-lg text-sm text-gray-700 overflow-auto">
                            {JSON.stringify(analysisResult.analysis, null, 2)}
                        </pre>
                    </div>
                )}
            </main>

            <footer className="mt-8 text-center text-gray-500 text-sm">
                Built with Next.js, Tailwind CSS, and OpenAI API
            </footer>
        </div>
    );
}

"use client"
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Send, HelpCircle, MessageCircle } from "lucide-react";

const FAQs = () => {
  const [question, setQuestion] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && email.trim()) {
      setSubmitted(true);
      setQuestion("");
      setEmail("");
      // In a real app, you would send this to your backend
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  const faqData = [
    {
      question: "What is JalRakshak?",
      answer: "JalRakshak is a comprehensive water management and analysis system that helps monitor water resources, analyze weather patterns, and suggest optimal water recharge structures for sustainable water management."
    },
    {
      question: "How does the weather analysis work?",
      answer: "Our weather analysis uses real-time data from meteorological services to provide current weather conditions, rainfall patterns, and annual rainfall data for specific locations to help in water resource planning."
    },
    {
      question: "What types of recharge structures are suggested?",
      answer: "The system suggests various recharge structures including percolation tanks, check dams, recharge wells, contour bunding, and farm ponds based on the local geography, soil type, and rainfall patterns."
    },
    {
      question: "How accurate is the rainfall data?",
      answer: "Our rainfall data is sourced from reliable meteorological databases and is updated regularly. However, for critical decisions, we recommend cross-referencing with local weather stations and official meteorological department data."
    },
    {
      question: "Can I get historical weather data?",
      answer: "Yes, our system provides access to historical weather data including annual rainfall patterns, seasonal variations, and long-term climate trends to help in comprehensive water resource planning."
    },
    {
      question: "Is the system free to use?",
      answer: "JalRakshak offers both free and premium features. Basic weather analysis and general recommendations are available for free, while advanced analytics and detailed reports require a subscription."
    },
    {
      question: "How do I interpret the analysis results?",
      answer: "Our analysis results include detailed explanations and recommendations. Each metric is explained with context, and we provide actionable insights for water management decisions. You can also contact our support team for clarification."
    },
    {
      question: "Can I export the analysis data?",
      answer: "Yes, you can export analysis reports, weather data, and recommendations in various formats including PDF, Excel, and CSV for further analysis or sharing with stakeholders."
    }
  ];

  return (
    <div className="min-h-screen  dark:from-[#0b1220] dark:to-[#0b1220] py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-900 dark:text-blue-100 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-blue-700 dark:text-blue-300 max-w-2xl mx-auto">
            Find answers to common questions about JalRakshak water management system
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* FAQ Section */}
          <div className="lg:col-span-2">
            <Card className="mb-8 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 border-blue-200/50 dark:border-blue-800/50">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                  <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Common Questions
                </CardTitle>
                <CardDescription className="text-blue-700 dark:text-blue-300">
                  Browse through our most frequently asked questions
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <Accordion type="single" collapsible className="w-full">
                  {faqData.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="border-b border-blue-100 dark:border-blue-800/30 last:border-b-0">
                      <AccordionTrigger className="text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md px-3 py-2 transition-colors duration-200 hover:text-blue-700 dark:hover:text-blue-300">
                        <span className="font-medium">{faq.question}</span>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground px-3 py-2 bg-blue-50/50 dark:bg-blue-900/10 rounded-md mt-2 transition-all duration-200">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>

          {/* Ask Question Section */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/10 hover:-translate-y-1 border-green-200/50 dark:border-green-800/50">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-100">
                  <MessageCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  Ask a Question
                </CardTitle>
                <CardDescription className="text-green-700 dark:text-green-300">
                  Can't find what you're looking for? Ask us directly!
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {submitted ? (
                  <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                    <HelpCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <AlertDescription className="text-green-700 dark:text-green-300">
                      Thank you for your question! We'll get back to you within 24 hours.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-green-700 dark:text-green-300 font-medium">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="border-green-200 focus:border-green-400 focus:ring-green-400/20 dark:border-green-800 dark:focus:border-green-600 dark:focus:ring-green-600/20 transition-colors duration-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="question" className="text-green-700 dark:text-green-300 font-medium">Your Question</Label>
                      <Textarea
                        id="question"
                        placeholder="What would you like to know about JalRakshak?"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        required
                        rows={4}
                        className="border-green-200 focus:border-green-400 focus:ring-green-400/20 dark:border-green-800 dark:focus:border-green-600 dark:focus:ring-green-600/20 transition-colors duration-200"
                      />
                    </div>
                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white transition-all duration-200 hover:shadow-lg hover:shadow-green-500/25 hover:-translate-y-0.5">
                      <Send className="h-4 w-4 mr-2" />
                      Send Question
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contact Information */}
        <Card className="mt-8 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 border-purple-200/50 dark:border-purple-800/50">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-purple-900 dark:text-purple-100 mb-4">
                Still Need Help?
              </h3>
              <p className="text-purple-700 dark:text-purple-300 mb-6">
                Contact our support team for personalized assistance
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <div className="text-sm bg-purple-50 dark:bg-purple-900/20 px-4 py-3 rounded-lg border border-purple-200 dark:border-purple-800/30 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors duration-200">
                  <strong className="text-purple-800 dark:text-purple-200">Email:</strong> 
                  <span className="text-purple-700 dark:text-purple-300 ml-1">support@jalrakshak.com</span>
                </div>
                <div className="text-sm bg-purple-50 dark:bg-purple-900/20 px-4 py-3 rounded-lg border border-purple-200 dark:border-purple-800/30 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors duration-200">
                  <strong className="text-purple-800 dark:text-purple-200">Phone:</strong> 
                  <span className="text-purple-700 dark:text-purple-300 ml-1">+91-9876543210</span>
                </div>
                <div className="text-sm bg-purple-50 dark:bg-purple-900/20 px-4 py-3 rounded-lg border border-purple-200 dark:border-purple-800/30 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors duration-200">
                  <strong className="text-purple-800 dark:text-purple-200">Hours:</strong> 
                  <span className="text-purple-700 dark:text-purple-300 ml-1">Mon-Fri 9AM-6PM IST</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FAQs;

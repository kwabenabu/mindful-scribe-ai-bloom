
import React from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';

const FAQ = () => {
  const faqs = [
    {
      question: "How do I get started with journaling?",
      answer: "Simply start writing! There's no right or wrong way to journal. Share your thoughts, experiences, daily events, or reflections. The most important thing is to be consistent and authentic in your writing."
    },
    {
      question: "Can I edit or delete my journal entries?",
      answer: "Currently, journal entries cannot be edited or deleted once saved. This is by design to encourage authentic, in-the-moment reflection without the temptation to revise your thoughts later."
    },
    {
      question: "How does the sentiment analysis work?",
      answer: "Our AI analyzes the emotional tone of your journal entries and assigns a sentiment score. This helps you track your emotional patterns over time in the calendar and insights sections."
    },
    {
      question: "What are weekly goals and how do they work?",
      answer: "Weekly goals help you set and track objectives for each week. Click the goals button when writing an entry to view, add, or check off your weekly goals. Goals reset each Sunday."
    },
    {
      question: "How does calendar integration work?",
      answer: "You can connect your Google Calendar or Outlook Calendar in the Settings page. This allows you to sync detected events from your journal entries directly to your calendar."
    },
    {
      question: "Is my journal data private and secure?",
      answer: "Yes, your journal data is completely private. All entries are encrypted and only accessible by you. We use industry-standard security practices to protect your personal information."
    },
    {
      question: "Can I export my journal entries?",
      answer: "Journal export functionality is coming soon. You'll be able to download your entries in various formats including PDF and plain text."
    },
    {
      question: "How does the insights page work?",
      answer: "The insights page analyzes your journaling patterns, sentiment trends, goal completion rates, and writing consistency to provide you with personalized analytics about your journaling journey."
    },
    {
      question: "What should I write about in my journal?",
      answer: "Write about anything that matters to you - daily experiences, emotions, goals, challenges, gratitude, dreams, or random thoughts. The beauty of journaling is that it's your personal space for reflection."
    },
    {
      question: "How often should I journal?",
      answer: "There's no set frequency - some people write daily, others weekly. The key is finding a rhythm that works for you and being consistent with it. Even a few sentences can be meaningful."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
              <HelpCircle className="h-8 w-8" />
              Frequently Asked Questions
            </h1>
            <p className="text-gray-600">
              Find answers to common questions about using the journal app
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Common Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Still have questions?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                If you can't find the answer you're looking for, feel free to reach out through the Settings page 
                or continue exploring the app - sometimes the best way to learn is by experimenting!
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default FAQ;

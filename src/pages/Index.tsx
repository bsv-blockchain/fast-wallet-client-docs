
import { useState, useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { CodeSnippetContainer } from "@/components/CodeSnippetContainer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { topicsData } from "@/snippets/_data";

const Index = () => {
  const [selectedTopic, setSelectedTopic] = useState("tokens");
  const [searchParams] = useSearchParams();
  const location = useLocation();

  // Find the current topic based on selected ID
  const currentTopic = topicsData.find(topic => topic.id === selectedTopic);
  
  // Handle scroll to specific snippet when URL contains snippet parameter
  useEffect(() => {
    const snippetId = searchParams.get('snippet');
    if (snippetId) {
      // Find which topic contains this snippet
      const topicWithSnippet = topicsData.find(topic => 
        topic.snippets.some(snippet => snippet.id === snippetId)
      );
      
      // If found, select that topic first
      if (topicWithSnippet && topicWithSnippet.id !== selectedTopic) {
        setSelectedTopic(topicWithSnippet.id);
      }
      
      // Small delay to ensure the DOM is updated before scrolling
      setTimeout(() => {
        const element = document.getElementById(snippetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [searchParams, location.search, selectedTopic]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar 
          topics={topicsData} 
          selectedTopic={selectedTopic}
          onTopicChange={setSelectedTopic}
        />
        <main className="flex-1 overflow-auto">
          {/* Mobile header with buttons */}
          <div className="md:hidden flex justify-between items-center p-4 pt-6">
            <SidebarTrigger />
            <ThemeToggle />
          </div>
          
          {/* Desktop theme toggle */}
          <div className="hidden md:block absolute top-6 right-6 z-10">
            <ThemeToggle />
          </div>
          
          <div className="max-w-4xl mx-auto space-y-8 p-6 pt-4 md:pt-16">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                WalletClient Quickstart
              </h1>
              <p className="text-xl text-muted-foreground">
                Interactive code snippets to learn BSV Blockchain development
              </p>
            </div>
            
            {currentTopic && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-foreground mb-8">
                  {currentTopic.title}
                </h2>
                <CodeSnippetContainer snippets={currentTopic.snippets} />
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;

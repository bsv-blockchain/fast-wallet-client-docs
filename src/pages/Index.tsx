
import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { CodeSnippetContainer } from "@/components/CodeSnippetContainer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { topicsData } from "@/data/topics";

const Index = () => {
  const [selectedTopic, setSelectedTopic] = useState("javascript-basics");

  const currentTopic = topicsData.find(topic => topic.id === selectedTopic);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar 
          topics={topicsData} 
          selectedTopic={selectedTopic}
          onTopicChange={setSelectedTopic}
        />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center mb-12 relative">
              <div className="absolute top-0 right-0">
                <ThemeToggle />
              </div>
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Developer Tools Demo
              </h1>
              <p className="text-xl text-muted-foreground">
                Interactive code snippets to learn programming concepts
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

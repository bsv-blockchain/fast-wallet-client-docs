
import { Code, Play, Book, Zap } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";

interface Topic {
  id: string;
  title: string;
  icon: any;
}

interface AppSidebarProps {
  topics: Topic[];
  selectedTopic: string;
  onTopicChange: (topicId: string) => void;
}

export function AppSidebar({ topics, selectedTopic, onTopicChange }: AppSidebarProps) {
  return (
    <Sidebar className="border-r border-border">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-semibold px-4 py-7">
            Goals
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {topics.map((topic) => (
                <SidebarMenuItem key={topic.id}>
                  <SidebarMenuButton
                    onClick={() => onTopicChange(topic.id)}
                    isActive={selectedTopic === topic.id}
                    className="w-full justify-start px-4 py-3"
                  >
                    <topic.icon className="mr-3 h-4 w-4" />
                    <span className="text-lg">{topic.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

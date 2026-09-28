import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from '@/components/ui/button'
import type { LucideIcon } from 'lucide-react'

interface Topic {
  id: string;
  title: string;
  icon: LucideIcon;
}

interface AppSidebarProps {
  topics: Topic[];
  selectedTopic: string;
  onTopicChange: (topicId: string) => void;
}

export function AppSidebar({ topics, selectedTopic, onTopicChange }: AppSidebarProps) {
  const { setOpenMobile, isMobile } = useSidebar();
  
  return (
    <Sidebar className="border-r border-border">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-4 text-base font-semibold">
            Goals
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {topics.map((topic) => (
                <SidebarMenuItem key={topic.id}>
                  <SidebarMenuButton
                    onClick={() => {
                      onTopicChange(topic.id);
                      if (isMobile) {
                        setOpenMobile(false);
                      }
                    }}
                    isActive={selectedTopic === topic.id}
                    className="h-auto w-full items-start justify-start whitespace-normal px-3 py-2.5 [&>span:last-child]:overflow-visible [&>span:last-child]:whitespace-normal [&>span:last-child]:text-clip"
                  >
                    <topic.icon className="mr-3 mt-0.5 h-4 w-4 shrink-0" />
                    <span className="text-left text-sm leading-snug">{topic.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 py-2 text-sm font-semibold">
            External Links
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Button aria-label="Open LLM training reference" onClick={() => window.location.assign('/llm-training-guide.txt')} className="h-auto w-full whitespace-normal bg-gradient-to-r from-orange-600 to-red-600 py-2 text-sm font-bold text-white">
                  LLM Training Reference
                </Button>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Button aria-label="Install BSV Desktop wallet" onClick={() => window.location.assign('https://desktop.bsvb.tech')} className="h-auto w-full whitespace-normal bg-gradient-to-r from-blue-600 to-purple-600 py-2 text-sm font-bold text-white">
                  Install BSV Desktop
                </Button>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}

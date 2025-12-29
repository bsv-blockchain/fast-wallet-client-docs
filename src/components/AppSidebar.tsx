import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

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
  const navigate = useNavigate();
  const { setOpenMobile, isMobile } = useSidebar();
  
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
                    onClick={() => {
                      // Change topic
                      onTopicChange(topic.id);
                      navigate({
                        search: '',
                      }, { replace: true });
                      // Close mobile menu after selection
                      if (isMobile) {
                        setOpenMobile(false);
                      }
                    }}
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
        <SidebarGroup className="absolute bottom-8">
          <SidebarGroupLabel className="text-lg font-semibold px-4 py-7">
            External Links
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>  
              <SidebarMenuItem>
                <Button onClick={() => window.location.assign('/llm-training-guide.txt')} className="w-full font-bold bg-gradient-to-r from-orange-600 to-red-600 text-white">
                  LLM Training Reference
                </Button>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Button onClick={() => window.location.assign('https://desktop.bsvb.tech')} className="w-full font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  Get a BRC-100 Wallet
                </Button>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

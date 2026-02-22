import * as LucideIcons from "lucide-react";
import { LucideProps } from "lucide-react";
import { FC } from "react";

type IconComponent = FC<LucideProps>;

const iconMap: Record<string, IconComponent> = {
  MessageCircle: LucideIcons.MessageCircle,
  Webhook: LucideIcons.Webhook,
  Clock: LucideIcons.Clock,
  Bot: LucideIcons.Bot,
  Brain: LucideIcons.Brain,
  Sparkles: LucideIcons.Sparkles,
  Database: LucideIcons.Database,
  Search: LucideIcons.Search,
  Globe: LucideIcons.Globe,
  Code: LucideIcons.Code,
  Workflow: LucideIcons.Workflow,
  GitBranch: LucideIcons.GitBranch,
  Route: LucideIcons.Route,
  Merge: LucideIcons.Merge,
  Send: LucideIcons.Send,
  Mail: LucideIcons.Mail,
  Variable: LucideIcons.Variable,
  FileJson: LucideIcons.FileJson,
  Zap: LucideIcons.Zap,
  Wrench: LucideIcons.Wrench,
  Play: LucideIcons.Play,
  ChevronRight: LucideIcons.ChevronRight,
  ChevronDown: LucideIcons.ChevronDown,
  Plus: LucideIcons.Plus,
  Trash2: LucideIcons.Trash2,
  Settings: LucideIcons.Settings,
  X: LucideIcons.X,
  Download: LucideIcons.Download,
  Upload: LucideIcons.Upload,
  Save: LucideIcons.Save,
  RotateCcw: LucideIcons.RotateCcw,
  PanelLeftClose: LucideIcons.PanelLeftClose,
  PanelLeftOpen: LucideIcons.PanelLeftOpen,
  Copy: LucideIcons.Copy,
  ZoomIn: LucideIcons.ZoomIn,
  ZoomOut: LucideIcons.ZoomOut,
  Maximize: LucideIcons.Maximize,
  GripVertical: LucideIcons.GripVertical,
  MoreHorizontal: LucideIcons.MoreHorizontal,
  Eye: LucideIcons.Eye,
  EyeOff: LucideIcons.EyeOff,
  Share2: LucideIcons.Share2,
  Tag: LucideIcons.Tag,
  MousePointerClick: LucideIcons.MousePointerClick,
  ArrowRight: LucideIcons.ArrowRight,
};

export function getIcon(name: string): IconComponent {
  return iconMap[name] || LucideIcons.Circle;
}

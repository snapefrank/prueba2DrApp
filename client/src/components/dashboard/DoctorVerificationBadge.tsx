import { CheckCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type VerificationStatus = "pending" | "approved" | "rejected";

interface DoctorVerificationBadgeProps {
  status: VerificationStatus;
  showText?: boolean;
  className?: string;
}

export default function DoctorVerificationBadge({ 
  status, 
  showText = true,
  className 
}: DoctorVerificationBadgeProps) {
  let badgeVariant: "default" | "outline" | "secondary" | "destructive" | null | undefined;
  let icon;
  let text;
  
  switch (status) {
    case "approved":
      badgeVariant = "default";
      icon = <CheckCircle className="h-3.5 w-3.5" />;
      text = "Verificado";
      break;
    case "rejected":
      badgeVariant = "destructive";
      icon = <AlertCircle className="h-3.5 w-3.5" />;
      text = "Rechazado";
      break;
    case "pending":
    default:
      badgeVariant = "secondary";
      icon = <AlertCircle className="h-3.5 w-3.5" />;
      text = "Pendiente";
      break;
  }
  
  const tooltipText = status === "approved" 
    ? "Este médico ha sido verificado por MediConnect" 
    : status === "rejected"
    ? "La verificación de este médico ha sido rechazada"
    : "Este médico está pendiente de verificación";
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={badgeVariant} className={`flex items-center gap-1 ${className}`}>
            {icon}
            {showText && <span>{text}</span>}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
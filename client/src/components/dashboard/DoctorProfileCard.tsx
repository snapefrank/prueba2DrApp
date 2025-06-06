import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DoctorVerificationBadge from "./DoctorVerificationBadge";

interface DoctorProfileCardProps {
  id: number;
  name: string;
  specialty: string;
  profileImage?: string | null;
  verificationStatus: "pending" | "approved" | "rejected";
  bio?: string;
}

export default function DoctorProfileCard({
  id,
  name,
  specialty,
  profileImage,
  verificationStatus,
  bio
}: DoctorProfileCardProps) {
  // Get initials for avatar fallback
  const initials = name
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Avatar className="h-12 w-12 border">
                <AvatarImage src={profileImage || ""} alt={name} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              
              {/* Positioned verification badge */}
              <div className="absolute -bottom-1 -right-1">
                <DoctorVerificationBadge 
                  status={verificationStatus} 
                  showText={false} 
                />
              </div>
            </div>
            <div>
              <div>{name}</div>
              <div className="text-sm text-muted-foreground">{specialty}</div>
            </div>
          </div>
          <div>
            <DoctorVerificationBadge status={verificationStatus} />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {bio && <p className="text-sm text-muted-foreground">{bio}</p>}
      </CardContent>
    </Card>
  );
}
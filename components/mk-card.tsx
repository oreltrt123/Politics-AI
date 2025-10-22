import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface MKCardProps {
  name: string
  party: string
  imgUrl?: string
  speechCount: number
  impactScore: number
  rank: number
}

export function MKCard({ name, party, imgUrl, speechCount, impactScore, rank }: MKCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="text-3xl font-bold text-muted-foreground w-8">{rank}</div>
          <Avatar className="w-16 h-16">
            <AvatarImage src={imgUrl || "/placeholder.svg"} alt={name} />
            <AvatarFallback>
              {name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1" dir="rtl">
            <h3 className="font-semibold text-lg">{name}</h3>
            <Badge variant="secondary" className="mt-1">
              {party}
            </Badge>
          </div>
          <div className="text-left" dir="rtl">
            <div className="text-sm text-muted-foreground">נאומים</div>
            <div className="text-2xl font-bold">{speechCount}</div>
          </div>
          <div className="text-left" dir="rtl">
            <div className="text-sm text-muted-foreground">השפעה</div>
            <div className="text-2xl font-bold text-primary">{Math.round(impactScore)}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

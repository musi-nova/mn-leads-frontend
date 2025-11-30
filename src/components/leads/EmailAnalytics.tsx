
import { Card } from "@/components/ui/card";
import { useSesAnalytics } from "@/hooks/useLeads";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

export const EmailAnalytics = () => {
  const { data, isLoading, error } = useSesAnalytics();

  if (isLoading) return <span className="text-muted-foreground">Loading analytics...</span>;
  if (error) return <span className="text-destructive">Failed to load analytics</span>;
  if (!data) return null;

  return (
    <div className="my-4 w-full flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-4">
        <Card className="flex flex-col items-center justify-center p-4 gap-2 min-w-[120px]">
          <div className="text-2xl font-bold">{data.total_deliveries}</div>
          <div className="text-sm text-muted-foreground">Total Deliveries</div>
        </Card>
        <Card className="flex flex-col items-center justify-center p-4 gap-2 min-w-[120px]">
          <div className="text-2xl font-bold">{data.total_bounces}</div>
          <div className="text-sm text-muted-foreground">Bounces</div>
        </Card>
        <Card className="flex flex-col items-center justify-center p-4 gap-2 min-w-[120px]">
          <div className="text-2xl font-bold">{data.total_complaints}</div>
          <div className="text-sm text-muted-foreground">Complaints</div>
        </Card>
        <Card className="flex flex-col items-center justify-center p-4 gap-2 min-w-[120px]">
          <div className="text-2xl font-bold">{data.total_rejects}</div>
          <div className="text-sm text-muted-foreground">Rejects</div>
        </Card>
      </div>
      <div className="w-full h-[400px] mt-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data.raw_data}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            style={{ background: "#fff", borderRadius: 8 }}
          >
            <XAxis
              dataKey="Timestamp"
              tickFormatter={t => new Date(t).toLocaleDateString()}
              axisLine={{ stroke: "#e5e7eb" }}
              tickLine={{ stroke: "#e5e7eb" }}
              allowDataOverflow={true}
              domain={["dataMin", "dataMax"]}
              tickCount={1}
            />
            <YAxis axisLine={{ stroke: "#e5e7eb" }} tickLine={{ stroke: "#e5e7eb" }} />
            <Tooltip labelFormatter={t => new Date(t).toLocaleString()} />
            <Legend />
            <Line type="monotone" dataKey="DeliveryAttempts" stroke="#2563eb" name="Deliveries" dot={false} />
            <Line type="monotone" dataKey="Bounces" stroke="#ef4444" name="Bounces" dot={false} />
            <Line type="monotone" dataKey="Complaints" stroke="#f59e42" name="Complaints" dot={false} />
            <Line type="monotone" dataKey="Rejects" stroke="#6b7280" name="Rejects" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

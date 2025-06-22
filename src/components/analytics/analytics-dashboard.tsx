import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart } from "recharts"
import { fetchMonthlyVideoStatsForPage, fetchVideoDetailStatsForPage } from "@/lib/facebook-insights";
import { fetchMonthlyTiktokVideoStats, fetchTiktokVideoDetailStats } from "@/lib/tiktok-insights";
import { endOfYear, startOfYear } from "date-fns";

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
        Card,
        CardContent,
        CardDescription,
        CardHeader,
        CardTitle,
} from "@/components/ui/card"
import {
        Popover,
        PopoverContent,
        PopoverTrigger,
} from "@/components/ui/popover"
import {
        Select,
        SelectContent,
        SelectItem,
        SelectTrigger,
        SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import {
        Table,
        TableBody,
        TableCell,
        TableHead,
        TableHeader,
        TableRow,
} from "@/components/ui/table"
import {
        Tabs,
        TabsContent,
        TabsList,
        TabsTrigger,
} from "@/components/ui/tabs"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Calendar as CalendarIcon, RefreshCw } from "lucide-react"
import { DateRange } from "react-day-picker"
import { addDays, format } from "date-fns"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"; // Thêm dòng này nếu bạn dùng hệ thống toast

const tableData = [
        { id: "VID001", title: "My Awesome First Video", thumbnail: "https://images.pexels.com/videos/3209828/free-video-3209828.jpg?auto=compress&cs=tinysrgb&dpr=1&w=500", views: 12043, likes: 256, comments: 48, shares: 12 },
        { id: "VID002", title: "Mountain Trip", thumbnail: "https://images.pexels.com/videos/857134/free-video-857134.jpg?auto=compress&cs=tinysrgb&dpr=1&w=500", views: 8901, likes: 180, comments: 22, shares: 8 },
        { id: "VID003", title: "Unboxing New Tech", thumbnail: "https://images.pexels.com/videos/3194248/free-video-3194248.jpg?auto=compress&cs=tinysrgb&dpr=1&w=500", views: 25402, likes: 512, comments: 128, shares: 64 },
]

export function AnalyticsDashboard() {
        const now = new Date();
        // Mặc định range là 3 tháng gần nhất
        const defaultFrom = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        const defaultTo = endOfYear(now) < now ? endOfYear(now) : now;

        const [date, setDate] = React.useState<DateRange | undefined>({
                from: defaultFrom,
                to: defaultTo,
        });
        const [fbChartData, setFbChartData] = React.useState<any[]>([]);
        const [fbVideoTableData, setFbVideoTableData] = React.useState<any[]>([]);
        const [fbLoading, setFbLoading] = React.useState(false);

        const [ttChartData, setTtChartData] = React.useState<any[]>([]);
        const [ttVideoTableData, setTtVideoTableData] = React.useState<any[]>([]);
        const [ttLoading, setTtLoading] = React.useState(false);

        // Kiểm tra range không quá 93 ngày
        const handleDateChange = (range: DateRange | undefined) => {
                if (!range?.from || !range?.to) {
                        setDate(range);
                        return;
                }
                const diff = (range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24);
                if (diff > 92) {
                        toast({
                                title: "Date range too long",
                                description: "Please select a date range of 93 days or less.",
                                variant: "destructive",
                        });
                        return;
                }
                setDate(range);
        };

        // Fetch Facebook stats khi date thay đổi hoặc khi vào tab Facebook
        React.useEffect(() => {
                if (!date?.from || !date?.to) return;
                setFbLoading(true);
                Promise.all([
                        fetchMonthlyVideoStatsForPage(
                                date.from.toISOString().slice(0, 10),
                                date.to.toISOString().slice(0, 10)
                        ),
                        fetchVideoDetailStatsForPage(
                                date.from.toISOString().slice(0, 10),
                                date.to.toISOString().slice(0, 10)
                        ),
                ])
                        .then(([monthly, detail]) => {
                                setFbChartData(monthly);
                                setFbVideoTableData(detail);
                        })
                        .finally(() => setFbLoading(false));
        }, [date]);
        // Fetch TikTok stats when date changes or TikTok tab is selected
        React.useEffect(() => {
                if (!date?.from || !date?.to) return;
                // Listen for tab change to TikTok
                const tabList = document.querySelector('[role="tablist"]');
                if (!tabList) return;
                const handleTabChange = () => {
                        const activeTab = (tabList.querySelector('[aria-selected="true"]') as HTMLElement)?.textContent;
                        if (activeTab === "TikTok") {
                                setTtLoading(true);
                                Promise.all([
                                        fetchMonthlyTiktokVideoStats(
                                                date.from!.toISOString().slice(0, 10),
                                                date.to!.toISOString().slice(0, 10)
                                        ),
                                        fetchTiktokVideoDetailStats(
                                                date.from!.toISOString().slice(0, 10),
                                                date.to!.toISOString().slice(0, 10)
                                        )
                                ])
                                .then(([monthlyStats, detail]) => {
                                        setTtChartData(monthlyStats);
                                        setTtVideoTableData(detail); // hoặc fetch thêm detail nếu muốn
                                })
                                .finally(() => setTtLoading(false));
                        }
                };
                tabList.addEventListener("click", handleTabChange);
                return () => {
                        tabList.removeEventListener("click", handleTabChange);
                };
        }, [date]);
        return (
                <Tabs defaultValue="facebook">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                                <TabsList>
                                        <TabsTrigger value="facebook">Facebook</TabsTrigger>
                                        <TabsTrigger value="youtube">YouTube</TabsTrigger>
                                        <TabsTrigger value="tiktok">TikTok</TabsTrigger>
                                </TabsList>
                                <div className="flex items-center gap-2">
                                        <Popover>
                                                <PopoverTrigger asChild>
                                                        <Button
                                                                id="date"
                                                                variant={"outline"}
                                                                className={cn(
                                                                        "w-full sm:w-[300px] justify-start text-left font-normal",
                                                                        !date && "text-muted-foreground"
                                                                )}
                                                        >
                                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                                {date?.from ? (
                                                                        date.to ? (
                                                                                <>
                                                                                        {format(date.from, "LLL dd, y")} -{" "}
                                                                                        {format(date.to, "LLL dd, y")}
                                                                                </>
                                                                        ) : (
                                                                                format(date.from, "LLL dd, y")
                                                                        )
                                                                ) : (
                                                                        <span>Select date range</span>
                                                                )}
                                                        </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="end">
                                                        <Calendar
                                                                initialFocus
                                                                mode="range"
                                                                defaultMonth={date?.from}
                                                                selected={date}
                                                                onSelect={handleDateChange}
                                                                numberOfMonths={2}
                                                        />
                                                </PopoverContent>
                                        </Popover>
                                        <Button
                                                size="sm"
                                                onClick={() => window.location.reload()}
                                        >
                                                <RefreshCw className="mr-2 h-4 w-4" /> Refresh
                                        </Button>
                                </div>
                        </div>

                        <TabsContent value="facebook">
                                <AnalyticsTabContent
                                        platform="Facebook"
                                        chartData={fbChartData}
                                        videoTableData={fbVideoTableData}
                                        loading={fbLoading}
                                />
                        </TabsContent>
                        <TabsContent value="youtube">
                                <AnalyticsTabContent platform="YouTube" chartData={fbChartData} 
                                        videoTableData={fbVideoTableData} loading={fbLoading} />
                        </TabsContent>
                        <TabsContent value="tiktok">
                                <AnalyticsTabContent platform="TikTok" chartData={ttChartData} 
                                        videoTableData={ttVideoTableData} loading={ttLoading} />
                        </TabsContent>
                </Tabs>
        )
}

const AnalyticsTabContent = ({
        platform,
        chartData,
        videoTableData = [],
        loading,
}: {
        platform: string;
        chartData: any[];
        videoTableData?: any[];
        loading?: boolean;
}) => {
        const [metric, setMetric] = React.useState("views");
        const [chartType, setChartType] = React.useState("bar");

        const platformColors: { [key: string]: string } = {
                Facebook: "#2563eb", // Blue
                YouTube: "hsl(var(--destructive))", // Red
                TikTok: "#22c55e", // Green
        };

        const metricLabels: { [key: string]: string } = {
                views: "Views",
                likes: "Likes",
                comments: "Comments",
                shares: "Shares",
        };

        const chartConfig = {
                [metric]: {
                        label: metricLabels[metric],
                        color: platformColors[platform] || "hsl(var(--chart-1))",
                },
        } satisfies ChartConfig;

        return (
                <div className="space-y-6">
                        <Card>
                                <CardHeader className="flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex-1">
                                                <CardTitle>Statistics Over Time</CardTitle>
                                                <CardDescription>
                                                        Total {metricLabels[metric].toLowerCase()} for your {platform} videos in the selected date range.
                                                </CardDescription>
                                        </div>
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                                <Select value={metric} onValueChange={setMetric}>
                                                        <SelectTrigger className="w-full sm:w-[150px]">
                                                                <SelectValue placeholder="Select metric" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                                <SelectItem value="views">Views</SelectItem>
                                                                <SelectItem value="likes">Likes</SelectItem>
                                                                <SelectItem value="comments">Comments</SelectItem>
                                                                <SelectItem value="shares">Shares</SelectItem>
                                                        </SelectContent>
                                                </Select>
                                                <RadioGroup defaultValue="bar" value={chartType} onValueChange={setChartType} className="flex items-center space-x-4">
                                                        <div className="flex items-center space-x-2">
                                                                <RadioGroupItem value="bar" id={`r1-${platform}`} />
                                                                <Label htmlFor={`r1-${platform}`}>Bar</Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                                <RadioGroupItem value="line" id={`r2-${platform}`} />
                                                                <Label htmlFor={`r2-${platform}`}>Line</Label>
                                                        </div>
                                                </RadioGroup>
                                        </div>
                                </CardHeader>
                                <CardContent>
                                        {loading ? (
                                                <div>Loading...</div>
                                        ) : (
                                                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                                                        {chartType === "bar" ? (
                                                                <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                                                                        <CartesianGrid vertical={false} />
                                                                        <XAxis
                                                                                dataKey="month"
                                                                                tickLine={false}
                                                                                tickMargin={10}
                                                                                axisLine={false}
                                                                        />
                                                                        <YAxis />
                                                                        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                                                        <Bar dataKey={metric} fill={`var(--color-${metric})`} radius={8} />
                                                                </BarChart>
                                                        ) : (
                                                                <LineChart data={chartData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                                                                        <CartesianGrid vertical={false} />
                                                                        <XAxis
                                                                                dataKey="month"
                                                                                tickLine={false}
                                                                                tickMargin={10}
                                                                                axisLine={false}
                                                                        />
                                                                        <YAxis />
                                                                        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                                                        <Line type="monotone" dataKey={metric} stroke={`var(--color-${metric})`} strokeWidth={2} activeDot={{ r: 8 }} />
                                                                </LineChart>
                                                        )}
                                                </ChartContainer>
                                        )}
                                </CardContent>
                        </Card>
                        <Card>
                                <CardHeader>
                                        <CardTitle>Video Performance</CardTitle>
                                        <CardDescription>
                                                Detailed statistics for each video on {platform}.
                                        </CardDescription>
                                </CardHeader>
                                <CardContent>
                                        <Table>
                                                <TableHeader>
                                                        <TableRow>
                                                                <TableHead className="w-[120px]">Thumbnail</TableHead>
                                                                <TableHead>Video Title</TableHead>
                                                                <TableHead className="text-right">Views</TableHead>
                                                                <TableHead className="text-right">Likes</TableHead>
                                                                <TableHead className="text-right">Comments</TableHead>
                                                                <TableHead className="text-right">Shares</TableHead>
                                                        </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                        {videoTableData.map(video => (
                                                                <TableRow key={video.id}>
                                                                        <TableCell>
                                                                                <img
                                                                                        src={video.thumbnail}
                                                                                        alt={video.title}
                                                                                        className="w-24 aspect-video rounded-md object-cover"
                                                                                />
                                                                        </TableCell>
                                                                        <TableCell className="font-medium">{video.title}</TableCell>
                                                                        <TableCell className="text-right">{video.views.toLocaleString()}</TableCell>
                                                                        <TableCell className="text-right">{video.likes.toLocaleString()}</TableCell>
                                                                        <TableCell className="text-right">{video.comments.toLocaleString()}</TableCell>
                                                                        <TableCell className="text-right">{video.shares.toLocaleString()}</TableCell>
                                                                </TableRow>
                                                        ))}
                                                </TableBody>
                                        </Table>
                                </CardContent>
                        </Card>
                </div>
        );
}

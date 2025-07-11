import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart } from "recharts"
import { fetchMonthlyVideoStatsForPage, fetchVideoDetailStatsForPage } from "@/lib/facebook-insights";
import { fetchMonthlyTiktokVideoStats, fetchTiktokVideoDetailStats } from "@/lib/tiktok-insights";
import { fetchMonthlyYouTubeVideoStats, fetchYouTubeVideoDetailStats } from "@/lib/youtube-insights";
import { endOfYear, startOfYear, addDays, format, endOfDay, startOfDay } from "date-fns";

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
import { Calendar as CalendarIcon, RefreshCw, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"; // Thêm dòng này nếu bạn dùng hệ thống toast

const tableData = [
        { id: "VID001", title: "My Awesome First Video", thumbnail: "https://images.pexels.com/videos/3209828/free-video-3209828.jpg?auto=compress&cs=tinysrgb&dpr=1&w=500", views: 12043, likes: 256, comments: 48, shares: 12 },
        { id: "VID002", title: "Mountain Trip", thumbnail: "https://images.pexels.com/videos/857134/free-video-857134.jpg?auto=compress&cs=tinysrgb&dpr=1&w=500", views: 8901, likes: 180, comments: 22, shares: 8 },
        { id: "VID003", title: "Unboxing New Tech", thumbnail: "https://images.pexels.com/videos/3194248/free-video-3194248.jpg?auto=compress&cs=tinysrgb&dpr=1&w=500", views: 25402, likes: 512, comments: 128, shares: 64 },
]

// Helper function to calculate growth rate
const calculateGrowthRate = (chartData: any[], metric: string) => {
        if (chartData.length < 2) return [];
        
        return chartData.map((item, index) => {
                if (index === 0) {
                        return { ...item, growthRate: 0 };
                }
                
                const current = item[metric] || 0;
                const previous = chartData[index - 1][metric] || 0;
                
                let growthRate = 0;
                if (previous > 0) {
                        growthRate = ((current - previous) / previous) * 100;
                }
                
                return { ...item, growthRate: parseFloat(growthRate.toFixed(2)) };
        });
};

// Growth Rate Card Component
const GrowthRateCard = ({ chartData, metric, platform }: { chartData: any[], metric: string, platform: string }) => {
        const growthData = calculateGrowthRate(chartData, metric);
        
        return (
                <Card>
                        <CardHeader>
                                <CardTitle>Monthly Growth Rate</CardTitle>
                                <CardDescription>
                                        Month-over-month percentage change in {metric} for {platform}
                                </CardDescription>
                        </CardHeader>
                        <CardContent>
                                <div className="space-y-3">
                                        {growthData.map((item, index) => {
                                                const isPositive = item.growthRate > 0;
                                                const isNegative = item.growthRate < 0;
                                                const isNeutral = item.growthRate === 0;
                                                
                                                return (
                                                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                                                <div className="flex items-center gap-2">
                                                                        <span className="font-medium">{item.month}</span>
                                                                        <span className="text-sm text-muted-foreground">
                                                                                ({item[metric]?.toLocaleString()} {metric})
                                                                        </span>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                        {isPositive && <TrendingUp className="h-4 w-4 text-green-500" />}
                                                                        {isNegative && <TrendingDown className="h-4 w-4 text-red-500" />}
                                                                        {isNeutral && <Minus className="h-4 w-4 text-gray-500" />}
                                                                        <span className={cn(
                                                                                "font-medium",
                                                                                isPositive && "text-green-600",
                                                                                isNegative && "text-red-600",
                                                                                isNeutral && "text-gray-600"
                                                                        )}>
                                                                                {index === 0 ? "Baseline" : `${item.growthRate > 0 ? '+' : ''}${item.growthRate}%`}
                                                                        </span>
                                                                </div>
                                                        </div>
                                                );
                                        })}
                                </div>
                        </CardContent>
                </Card>
        );
};

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

        const [ytChartData, setYtChartData] = React.useState<any[]>([]);
        const [ytVideoTableData, setYtVideoTableData] = React.useState<any[]>([]);
        const [ytLoading, setYtLoading] = React.useState(false);

        const CHANNEL_NAME = import.meta.env.VITE_YOUTUBE_CHANNEL;

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

        // Fetch Facebook stats when date changes
        React.useEffect(() => {
                if (!date?.from || !date?.to) return;
                setFbLoading(true);
                Promise.all([
                        fetchMonthlyVideoStatsForPage(
                                format(startOfDay(date.from), "yyyy-MM-dd"),
                                format(endOfDay(date.to), "yyyy-MM-dd")
                        ),
                        fetchVideoDetailStatsForPage(
                                format(startOfDay(date.from), "yyyy-MM-dd"),
                                format(endOfDay(date.to), "yyyy-MM-dd")
                        ),
                ])
                        .then(([monthly, detail]) => {
                                setFbChartData(monthly);
                                setFbVideoTableData(detail);
                        })
                        .finally(() => setFbLoading(false));
        }, [date]);

        // Fetch TikTok stats when date changes
        React.useEffect(() => {
                if (!date?.from || !date?.to) return;
                setTtLoading(true);
                Promise.all([
                        fetchMonthlyTiktokVideoStats(
                                format(startOfDay(date.from), "yyyy-MM-dd"),
                                format(endOfDay(date.to), "yyyy-MM-dd")
                        ),
                        fetchTiktokVideoDetailStats(
                                format(startOfDay(date.from), "yyyy-MM-dd"),
                                format(endOfDay(date.to), "yyyy-MM-dd")
                        )
                ])
                        .then(([monthlyStats, detail]) => {
                                setTtChartData(monthlyStats);
                                setTtVideoTableData(detail);
                        })
                        .finally(() => setTtLoading(false));
        }, [date]);

        // Fetch YouTube stats when date changes
        React.useEffect(() => {
                if (!date?.from || !date?.to) return;
                setYtLoading(true);
                Promise.all([
                        fetchMonthlyYouTubeVideoStats(
                                format(startOfDay(date.from), "yyyy-MM-dd"),
                                format(endOfDay(date.to), "yyyy-MM-dd"),
                                CHANNEL_NAME
                        ),
                        fetchYouTubeVideoDetailStats(
                                format(startOfDay(date.from), "yyyy-MM-dd"),
                                format(endOfDay(date.to), "yyyy-MM-dd"),
                                CHANNEL_NAME
                        )
                ])
                        .then(([monthlyStats, detail]) => {
                                setYtChartData(monthlyStats);
                                setYtVideoTableData(detail);
                        })
                        .finally(() => setYtLoading(false));
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
                                <AnalyticsTabContent platform="YouTube" chartData={ytChartData}
                                        videoTableData={ytVideoTableData} loading={ytLoading} />
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

        // Pagination state
        const [page, setPage] = React.useState(1);
        const [rowsPerPage, setRowsPerPage] = React.useState(5);

        const totalRows = videoTableData.length;
        const totalPages = Math.ceil(totalRows / rowsPerPage);
        const pagedData = videoTableData.slice((page - 1) * rowsPerPage, page * rowsPerPage);

        const platformColors: { [key: string]: string } = {
                Facebook: "#2563eb", // Blue
                YouTube: "hsl(var(--destructive))", // Red
                TikTok: "#22c55e", // Green
        };

        const metricLabels: { [key: string]: string } = {
                views: "Views",
                likes: "Likes",
                comments: "Comments",
                ...(platform !== "YouTube" && { shares: "Shares" }),
        };

        const chartConfig = {
                [metric]: {
                        label: metricLabels[metric],
                        color: platformColors[platform] || "hsl(var(--chart-1))",
                },
        } satisfies ChartConfig;

        return (
                <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                                                                        {platform !== "YouTube" && (
                                                                                <SelectItem value="shares">Shares</SelectItem>
                                                                        )}
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
                                
                                {/* Growth Rate Card */}
                                {!loading && chartData.length > 0 && (
                                        <GrowthRateCard 
                                                chartData={chartData} 
                                                metric={metric} 
                                                platform={platform} 
                                        />
                                )}
                        </div>
                        <Card>
                                <CardHeader>
                                        <CardTitle>Video Performance</CardTitle>
                                        <CardDescription>
                                                Detailed statistics for each video on {platform}.
                                        </CardDescription>
                                </CardHeader>
                                <CardContent>
                                        <div className="flex items-center justify-between mb-2">
                                                <div>
                                                        <label className="mr-2 text-sm">Rows per page:</label>
                                                        <select
                                                                value={rowsPerPage}
                                                                onChange={e => {
                                                                        setRowsPerPage(Number(e.target.value));
                                                                        setPage(1);
                                                                }}
                                                                className="border rounded px-2 py-1 text-sm bg-black text-white"
                                                        >
                                                                <option value={5}>5</option>
                                                                <option value={10}>10</option>
                                                                <option value={20}>20</option>
                                                        </select>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                        <button
                                                                className="px-2 py-1 border rounded disabled:opacity-50"
                                                                onClick={() => setPage(page - 1)}
                                                                disabled={page === 1}
                                                        >
                                                                Prev
                                                        </button>
                                                        <span className="text-sm">
                                                                Page {page} of {totalPages || 1}
                                                        </span>
                                                        <button
                                                                className="px-2 py-1 border rounded disabled:opacity-50"
                                                                onClick={() => setPage(page + 1)}
                                                                disabled={page === totalPages || totalPages === 0}
                                                        >
                                                                Next
                                                        </button>
                                                </div>
                                        </div>
                                        <Table>
                                                <TableHeader>
                                                        <TableRow>
                                                                <TableHead className="w-[120px]">Thumbnail</TableHead>
                                                                <TableHead>Video Title</TableHead>
                                                                <TableHead className="text-right">Views</TableHead>
                                                                <TableHead className="text-right">Likes</TableHead>
                                                                <TableHead className="text-right">Comments</TableHead>
                                                                {platform === "YouTube" ? null : (
                                                                        <TableHead className="text-right">Shares</TableHead>
                                                                )}
                                                        </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                        {pagedData.map(video => (
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
                                                                        {platform === "YouTube" ? null : (
                                                                                <TableCell className="text-right">{video.shares.toLocaleString()}</TableCell>
                                                                        )}
                                                                </TableRow>
                                                        ))}
                                                </TableBody>
                                        </Table>
                                </CardContent>
                        </Card>
                </div>
        );
}

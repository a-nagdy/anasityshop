import Order from "@/app/api/models/Order";
import Product from "@/app/api/models/Product";
import User from "@/app/api/models/User";
import { ApiResponseHelper } from "@/utils/apiResponse";
import { cacheHelper } from "@/utils/cache";
import dbConnect from "@/utils/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await dbConnect();

        // Use caching for expensive aggregation queries
        const statsData = await cacheHelper.withCache(
            cacheHelper.keys.stats(),
            async () => {
                // Use Promise.all to run queries in parallel for better performance
                const [
                    orderStats,
                    productStats,
                    userStats,
                    revenueStats,
                    orderStatusStats
                ] = await Promise.all([
                    // Basic order count
                    Order.countDocuments(),

                    // Product count
                    Product.countDocuments(),

                    // User count
                    User.countDocuments(),

                    // Revenue calculation with proper aggregation
                    Order.aggregate([
                        {
                            $match: {
                                isPaid: true,
                                status: { $nin: ['cancelled', 'refunded'] }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                totalRevenue: { $sum: "$totalPrice" },
                                avgOrderValue: { $avg: "$totalPrice" },
                                totalOrders: { $sum: 1 }
                            }
                        }
                    ]),

                    // Order status breakdown with optimized aggregation
                    Order.aggregate([
                        {
                            $group: {
                                _id: "$status",
                                count: { $sum: 1 }
                            }
                        },
                        {
                            $project: {
                                status: "$_id",
                                count: 1,
                                _id: 0
                            }
                        }
                    ])
                ]);

                // Calculate totals
                const totalOrders = orderStats;
                const totalProducts = productStats;
                const totalUsers = userStats;

                // Extract revenue data
                const revenueData = revenueStats[0] || { totalRevenue: 0, avgOrderValue: 0, totalOrders: 0 };
                const totalRevenue = revenueData.totalRevenue;
                const avgOrderValue = revenueData.avgOrderValue;

                // Process order status data
                const statusMap = new Map();
                orderStatusStats.forEach(item => {
                    statusMap.set(item.status.toLowerCase(), item.count);
                });

                // Calculate percentages with safe division
                const getPercentage = (count: number, total: number) =>
                    total > 0 ? Math.round((count / total) * 100) : 0;

                const deliveredCount = statusMap.get('delivered') || 0;
                const pendingCount = statusMap.get('pending') || 0;
                const cancelledCount = statusMap.get('cancelled') || 0;
                const processingCount = statusMap.get('processing') || 0;

                return {
                    totalOrders,
                    totalRevenue: Math.round(totalRevenue * 100) / 100, // Round to 2 decimals
                    avgOrderValue: Math.round(avgOrderValue * 100) / 100,
                    totalProducts,
                    totalUsers,
                    deliveredOrders: deliveredCount,
                    pendingOrders: pendingCount,
                    cancelledOrders: cancelledCount,
                    processingOrders: processingCount,
                    orderStatusPercentages: {
                        delivered: getPercentage(deliveredCount, totalOrders),
                        pending: getPercentage(pendingCount, totalOrders),
                        cancelled: getPercentage(cancelledCount, totalOrders),
                        processing: getPercentage(processingCount, totalOrders)
                    },
                    // Additional metrics
                    metrics: {
                        conversionRate: totalUsers > 0 ? getPercentage(totalOrders, totalUsers) : 0,
                        revenuePerUser: totalUsers > 0 ? Math.round((totalRevenue / totalUsers) * 100) / 100 : 0,
                        productsPerOrder: totalOrders > 0 ? Math.round((totalProducts / totalOrders) * 100) / 100 : 0
                    }
                };
            },
            600000 // Cache for 10 minutes
        );

        return NextResponse.json(
            ApiResponseHelper.success(statsData, 'Statistics retrieved successfully')
        );

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json(
            ApiResponseHelper.serverError('Failed to retrieve statistics'),
            { status: 500 }
        );
    }
}
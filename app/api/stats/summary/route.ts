import Order from "@/app/api/models/Order";
import Product from "@/app/api/models/Product";
import Customer from "@/app/api/models/User";
import dbConnect from "@/utils/db";
import { NextResponse } from "next/server";

export async function GET() {
    await dbConnect();
    const totalOrders = await Order.countDocuments();

    // Debug: Check one order to see actual field names and values
    const sampleOrder = await Order.findOne().lean();
    console.log("Sample order:", sampleOrder);

    // Try alternative field names that might exist in your documents
    const totalRevenue = await Order.aggregate([
        {
            $group: {
                _id: null,
                total: { $sum: "$total" },
                totalPrice: { $sum: "$totalPrice" },
                totalPriceSum: { $sum: "$totalPrice" }
            }
        }
    ]);


    const totalProducts = await Product.countDocuments();
    const totalUsers = await Customer.countDocuments();

    const deliveredOrders = await Order.countDocuments({ status: "Delivered" });
    const pendingOrders = await Order.countDocuments({ status: "Pending" });
    const cancelledOrders = await Order.countDocuments({ status: "Cancelled" });
    const processingOrders = await Order.countDocuments({ status: "Processing" });

    // Calculate percentages
    const deliveredPercentage = totalOrders ? Math.round((deliveredOrders / totalOrders) * 100) : 0;
    const pendingPercentage = totalOrders ? Math.round((pendingOrders / totalOrders) * 100) : 0;
    const cancelledPercentage = totalOrders ? Math.round((cancelledOrders / totalOrders) * 100) : 0;
    const processingPercentage = totalOrders ? Math.round((processingOrders / totalOrders) * 100) : 0;

    return NextResponse.json({
        totalOrders,
        totalRevenue: totalRevenue[0]?.totalPrice || totalRevenue[0]?.total || totalRevenue[0]?.totalPriceSum || 0,
        totalProducts,
        totalUsers,
        deliveredOrders,
        pendingOrders,
        cancelledOrders,
        processingOrders,
        orderStatusPercentages: {
            delivered: deliveredPercentage,
            pending: pendingPercentage,
            cancelled: cancelledPercentage,
            processing: processingPercentage
        },
    });
}
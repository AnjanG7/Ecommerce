import { EcomOrder } from "../../../models/apps/ecommerce/order.models.js";
import { EcomProfile } from "../../../models/apps/ecommerce/profile.models.js";
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { getMongoosePaginationOptions } from "../../../utils/helpers.js";

const createEcomProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, phoneNumber } = req.body;
  if ([firstName,lastName,phoneNumber].every((field)=>field?.trim()==="")) {
    throw new ApiError(400, "All the field are required!!!");
  }
  const createUser= await EcomProfile.create({
    firstName,
    lastName,
    phoneNumber
  })
  if (!createUser) {
    throw new ApiError(400,"Failed to create the EcomProfile!!!")
  }
  return res
  .status(200)
  .json(new ApiResponse(200, createUser, "Successfully created EcomProfile!!!"));


});
const getMyEcomProfile = asyncHandler(async (req, res) => {
  let profile = await EcomProfile.findOne({
    owner: req.user._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, profile, "User profile fetched successfully"));
});

const updateEcomProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, phoneNumber, countryCode } = req.body;
  const profile = await EcomProfile.findOneAndUpdate(
    {
      owner: req.user._id,
    },
    {
      $set: {
        firstName,
        lastName,
        phoneNumber,
        countryCode,
      },
    },
    { new: true }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, profile, "User profile updated successfully"));
});

const getMyOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const orderAggregate = EcomOrder.aggregate([
    {
      // Get orders associated with the user
      $match: {
        customer: req.user._id,
      },
    },
    // lookup for a customer associated with the order
    {
      $lookup: {
        from: "users",
        localField: "customer",
        foreignField: "_id",
        as: "customer",
        pipeline: [
          {
            $project: {
              _id: 1,
              username: 1,
              email: 1,
            },
          },
        ],
      },
    },
    // lookup for a coupon applied while placing the order
    {
      $lookup: {
        from: "coupons",
        foreignField: "_id",
        localField: "coupon",
        as: "coupon",
        pipeline: [
          {
            $project: {
              name: 1,
              couponCode: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        customer: { $first: "$customer" },
        coupon: { $ifNull: [{ $first: "$coupon" }, null] },
        totalOrderItems: { $size: "$items" },
      },
    },
    {
      $project: {
        items: 0,
      },
    },
  ]);

  const orders = await EcomOrder.aggregatePaginate(
    orderAggregate,
    getMongoosePaginationOptions({
      page,
      limit,
      customLabels: {
        totalDocs: "totalOrders",
        docs: "orders",
      },
    })
  );

  return res
    .status(200)
    .json(new ApiResponse(200, orders, "Orders fetched successfully"));
});

export { getMyEcomProfile, updateEcomProfile, getMyOrders, createEcomProfile };

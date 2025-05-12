import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Stack,
  Pagination,
  Button,
  Modal,
} from "@mui/material";
import orderServices from "services/orderServices";
import orderDetailServices from "services/orderDetailServices";
import boxOptionServices from "services/boxOptionServices";
import koiFishServices from "services/koiFishServices";
import distanceServices from "services/distanceServices";
import {
  getStatusColor,
  translateStatusToVietnamese,
  PriceFormat,
} from "utils/tools";

// Modal styling
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 800,
  maxHeight: "90vh",
  overflowY: "auto",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [displayedOrders, setDisplayedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [orderDetails, setOrderDetails] = useState([]);
  const [boxOptions, setBoxOptions] = useState([]);
  const [koiFish, setKoiFish] = useState([]);
  const [distance, setDistance] = useState({});

  const statusMessages = {
    Pending: "Đơn hàng mới",
    Approved: "Đã xác nhận",
    Packed: "Chờ sắp xếp chuyến",
    Delivering: "Đang vận chuyển",
    Completed: "Đã giao thành công",
    Cancelled: "Giao không thành công",
  };

  const statusColors = {
    Pending: "#fff3e6",
    Approved: "#e6f7ff",
    Packed: "#fff7e6",
    Delivering: "#e6fffa",
    Completed: "#d9f7be",
    Cancelled: "#ffccc7",
  };

  // Fetch all orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await orderServices.getOrder();
        if (response?.data?.data) {
          // Sort orders by orderId in descending order
          const sortedOrders = response.data.data.sort((a, b) => b.id - a.id);

          // Set sorted orders to state
          setOrders(sortedOrders);
          setTotalPages(Math.ceil(sortedOrders.length / itemsPerPage));
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setLoading(false);
      }
    };
    fetchOrders();
  }, [itemsPerPage]);

  // Paginate displayed orders
  useEffect(() => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setDisplayedOrders(orders.slice(startIndex, endIndex));
  }, [page, orders, itemsPerPage]);

  // Fetch order details for modal
  const handleViewOrderDetail = async (order) => {
    setSelectedOrder(order);
    setOpenModal(true);
    await fetchOrderDetails(order.id);
  };

  // Fetch details for a specific order
  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await orderDetailServices.getOrderDetail();
      if (response?.data?.data) {
        const matchedDetails = response.data.data.filter(
          (detail) => detail.orderId === orderId
        );
        setOrderDetails(matchedDetails);

        // Fetch Box Options
        for (const detail of matchedDetails) {
          await fetchBoxOption(detail.boxOptionId);
        }

        // Fetch Distance Info
        if (matchedDetails[0]?.distanceId) {
          await fetchDistance(matchedDetails[0].distanceId);
        }
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
    }
  };

  const fetchBoxOption = async (boxOptionId) => {
    try {
      const response = await boxOptionServices.getBoxOption();
      if (response?.data?.data) {
        const matchedBoxOption = response.data.data.find(
          (option) => option.boxOptionId === boxOptionId
        );
        if (matchedBoxOption) {
          setBoxOptions((prev) => [...prev, matchedBoxOption]);

          // Fetch related Koi Fish
          if (matchedBoxOption.fishes) {
            for (const fish of matchedBoxOption.fishes) {
              await fetchKoiFish(fish.fishId);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error fetching box options:", error);
    }
  };

  const fetchKoiFish = async (fishId) => {
    try {
      const response = await koiFishServices.getKoiFishById(fishId);
      if (response?.data?.data) {
        setKoiFish((prev) => [...prev, response.data.data]);
      }
    } catch (error) {
      console.error("Error fetching koi fish:", error);
    }
  };

  const fetchDistance = async (distanceId) => {
    try {
      const response = await distanceServices.getDistanceById(distanceId);
      if (response?.data?.data) {
        setDistance(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching distance:", error);
    }
  };

  // Handle pagination change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Close the modal and reset states
  const handleCloseModal = () => {
    setOpenModal(false);
    setOrderDetails([]);
    setBoxOptions([]);
    setKoiFish([]);
  };

  // Calculate total quantity of Koi fish
  const totalQuantity = boxOptions.reduce((total, option) => {
    return total + option.fishes.reduce((sum, fish) => sum + fish.quantity, 0);
  }, 0);

  const renderOrderDetails = (order) => (
    <div className="card-bottom" key={order.id}>
      <div className="card-bottom-item">
        <div className="card-icon">
          <i className="fa-solid fa-calendar-days" />
        </div>
        <div className="card-dt-text">
          <h6>Người Nhận</h6>
          <span>{order.receiverName}</span>
        </div>
      </div>
      <div className="card-bottom-item">
        <div className="card-icon">
          <i className="fa-solid fa-map-marker-alt" />
        </div>
        <div className="card-dt-text">
          <h6>Địa chỉ người nhận</h6>
          <span>{order.receiverAddress}</span>
        </div>
      </div>
      <div className="card-bottom-item">
        <div className="card-icon">
          <i className="fa-solid fa-phone" />
        </div>
        <div className="card-dt-text">
          <h6>SĐT người nhận</h6>
          <span>{order.receiverPhone}</span>
        </div>
      </div>
      <div className="card-bottom-item">
        <div className="card-icon">
          <i className="fa-solid fa-money-bill" />
        </div>
        <div className="card-dt-text">
          <h6>Tổng chi phí Đơn hàng</h6>
          <span>
            <PriceFormat price={order.totalFee} />
          </span>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div
      className="tab-pane fade active show"
      id="feed"
      role="tabpanel"
      aria-labelledby="feed-tab"
    >
      <div className="tab-content mt-4">
        <div
          className="tab-pane fade show active"
          id="Orders"
          role="tabpanel"
          aria-labelledby="orders-tab"
        >
          {displayedOrders.length > 0 ? (
            displayedOrders.map((order) => (
              <div className="main-card mt-4" key={order.id}>
                <div
                  className="card-top p-4"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  {/* Order ID and Status */}
                  <div style={{ flex: 1 }}>
                    <Typography variant="h6">
                      Mã đơn hàng: {order.id}
                    </Typography>
                    <Typography
                      variant="body1"
                      style={{
                        color: getStatusColor(order.isShipping),
                        marginTop: 4,
                      }}
                    >
                      {translateStatusToVietnamese(order.isShipping)}
                    </Typography>
                  </div>

                  {/* Button for viewing details */}
                  <Button
                    variant="contained"
                    onClick={() => handleViewOrderDetail(order)}
                    sx={{
                      backgroundColor: "#450b00",
                      color: "white",
                      "&:hover": { backgroundColor: "#ff7f50" },
                    }}
                  >
                    Xem chi tiết
                  </Button>
                </div>

                {/* Order Details Section */}
                <div
                  className="card-bottom p-4"
                  style={{ borderTop: "1px solid #ddd" }}
                >
                  {renderOrderDetails(order)}
                </div>
              </div>
            ))
          ) : (
            <Typography>No orders found</Typography>
          )}

          <Stack spacing={2} className="pagination-controls mt-3 mb-2">
            <Pagination
              count={totalPages}
              page={page}
              onChange={handleChangePage}
              variant="outlined"
              shape="rounded"
              className="custom-pagination"
            />
          </Stack>
        </div>

        {/* Modal for Order Details */}
        <Modal open={openModal} onClose={handleCloseModal}>
          <Box sx={modalStyle} className="modal-content">
            {selectedOrder ? (
              <>
                <Typography variant="h4" gutterBottom>
                  Trạng thái đơn hàng:{" "}
                  {statusMessages[selectedOrder.isShipping] || "Không xác định"}
                </Typography>

                <Box
                  className="order-info-box"
                  sx={{
                    backgroundColor: statusColors[selectedOrder.isShipping],
                    padding: 2,
                    borderRadius: 1,
                    marginBottom: 2,
                  }}
                >
                  <Typography variant="h6">Thông tin gửi nhận</Typography>
                  <Paper sx={{ padding: 2, marginTop: 2 }}>
                    <Typography>
                      Người gửi: {selectedOrder.senderName}
                    </Typography>
                    <Typography>
                      Địa chỉ gửi: {selectedOrder.senderAddress}
                    </Typography>
                    <Typography>
                      Người nhận: {selectedOrder.receiverName} /{" "}
                      {selectedOrder.receiverPhone}
                    </Typography>
                    <Typography>
                      Địa chỉ nhận: {selectedOrder.receiverAddress}
                    </Typography>
                  </Paper>
                </Box>

                <Divider sx={{ marginBottom: 2 }} />

                {/* Koi Fish Information */}
                <Box
                  className="koi-info-box"
                  sx={{
                    backgroundColor: statusColors[selectedOrder.isShipping],
                    padding: 2,
                    borderRadius: 1,
                    marginBottom: 2,
                  }}
                >
                  <Typography variant="h6">Thông tin cá Koi</Typography>
                  <Typography>Tổng số lượng cá: {totalQuantity}</Typography>

                  {boxOptions.map((option, index) => (
                    <Paper
                      key={index}
                      className="box-option"
                      sx={{
                        padding: 2,
                        marginTop: 2,
                        marginBottom: 2,
                        border: "1px solid #ccc",
                        borderRadius: 1,
                      }}
                    >
                      {/* Box Option Details */}
                      <Box
                        className="box-option-header"
                        sx={{ marginBottom: 2 }}
                      >
                        <Typography variant="h6">
                          Box: {option.boxName}
                        </Typography>
                        <Typography>
                          Thể tích tối đa: {option.maxVolume} lít
                        </Typography>
                        <Typography>
                          Thể tích hiện tại: {option.totalVolume} lít
                        </Typography>
                      </Box>

                      {/* Fish Details */}
                      {option.fishes.map((fish, fishIndex) => {
                        const koi = koiFish.find((k) => k.id === fish.fishId);
                        return (
                          koi && (
                            <Box
                              key={fishIndex}
                              className="fish-item"
                              sx={{
                                marginTop: 2,
                                padding: 2,
                                border: "1px dashed #ddd",
                                borderRadius: 1,
                              }}
                            >
                              <Typography>
                                Cá: {koi.fishDescription} - Kích thước:{" "}
                                {koi.size} cm
                              </Typography>
                              <Typography>Số lượng: {fish.quantity}</Typography>
                            </Box>
                          )
                        );
                      })}
                    </Paper>
                  ))}
                </Box>

                <Divider sx={{ marginBottom: 2 }} />

                {/* Box Option Information */}
                <Box
                  className="box-info-box"
                  sx={{
                    backgroundColor: statusColors[selectedOrder.isShipping],
                    padding: 2,
                    borderRadius: 1,
                    marginBottom: 2,
                  }}
                >
                  <Typography variant="h6">Thông tin đóng gói</Typography>
                  <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Loại Hộp</TableCell>
                          <TableCell align="right">Chi phí từ Nhật</TableCell>
                          <TableCell align="right">
                            Chi phí trong nước
                          </TableCell>
                          <TableCell align="right">
                            Tổng thể tích cá/hộp
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {boxOptions.map((boxOption) => (
                          <TableRow key={boxOption.boxOptionId}>
                            <TableCell>{boxOption.boxName}</TableCell>
                            <TableCell align="right">
                              {boxOption.price.toLocaleString()} VND
                            </TableCell>
                            <TableCell align="right">
                              {(() => {
                                let localCost = 0;
                                if (boxOption.boxName.includes("Medium")) {
                                  localCost = distance.price + 150000;
                                } else if (
                                  boxOption.boxName.includes("Large")
                                ) {
                                  localCost = distance.price + 350000;
                                }
                                return localCost.toLocaleString();
                              })()}{" "}
                              VND
                            </TableCell>
                            <TableCell align="right">
                              {boxOption.totalVolume}/{boxOption.maxVolume} lít
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>

                <Divider sx={{ marginBottom: 2 }} />

                {/* Cost Information */}
                <Box
                  className="cost-info-box"
                  sx={{
                    backgroundColor: statusColors[selectedOrder.isShipping],
                    padding: 2,
                    borderRadius: 1,
                    marginBottom: 2,
                  }}
                >
                  <Typography variant="h6">Thông tin chi phí</Typography>
                  <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Loại Chi Phí</TableCell>
                          <TableCell align="right">Giá</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>Tổng chi phí</TableCell>
                          <TableCell align="right">
                            {selectedOrder.totalFee?.toLocaleString()} VND
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </>
            ) : (
              <Typography>No order selected</Typography>
            )}
          </Box>
        </Modal>
      </div>
    </div>
  );
};

export default OrdersPage;

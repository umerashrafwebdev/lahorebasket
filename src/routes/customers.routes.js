import express from "express";
import { getCustomers, getCustomer, addCustomer, updateCustomer, deleteCustomer, getCustomersCount, searchCustomers } from "../controllers/customers.controller.js";

const customerRouter = express.Router();

customerRouter.get("/", getCustomers);
customerRouter.get("/count", getCustomersCount);
customerRouter.get("/:id", getCustomer);
customerRouter.post("/", addCustomer);
customerRouter.put("/:id", updateCustomer);
customerRouter.delete("/:id", deleteCustomer);
customerRouter.get("/search", searchCustomers);

export default customerRouter;
import mongoose from "mongoose";
import Report from "../models/reportModel";

const reportPost = async function (data) {
  const report = new Report({
    _id: new mongoose.Types.ObjectId(),
    ...data
  });
  return report.save();
};

const findReportByPostIdDestinate = async function (idDestinate, commentId) {
    const report = await Report.findOne({ idDestinate: idDestinate, commentId: commentId });
    return report;
}

const addReport = async function (reportId, reporter) {
    const report = await Report.updateOne({_id: reportId}, {$push: {reporter: reporter}});
    return report;
}

const changeStatusReport = async function (reportId, status) {
    const report = await Report.updateOne({_id: reportId}, {$set: {status: status}});
    return report;
}

const getAllReport = async function (status) {
    const report = await Report.find({status: status})
    .populate("commentId")
    .populate("reporter.userId")
    .populate("reporter.centerId")
    .sort({createdAt: -1});
    return report;
};

const findReportById = async function (reportId) {
    const report = await Report.findOne({_id: reportId});
    return report;
};
export const reportService = {
  reportPost,
  findReportByPostIdDestinate,
  addReport,
  changeStatusReport,
  getAllReport,
  findReportById
};

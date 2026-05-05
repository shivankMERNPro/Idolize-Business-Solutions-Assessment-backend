import { Student } from '../models/student.model.js';
import { HTTP_STATUS, STATUS_MESSAGE } from '../constants/httpStatus.js';

export const createStudentService = async (data) => {
  const existingStudent = await Student.findOne({ email: data.email });

  if (existingStudent) {
    return {
      code: HTTP_STATUS.CONFLICT,
      message: 'Student with this email already exists',
    };
  }

  const student = await Student.create(data);

  return {
    code: HTTP_STATUS.CREATED,
    message: STATUS_MESSAGE[HTTP_STATUS.CREATED],
    data: student,
  };
};

export const getAllStudentsService = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const total = await Student.countDocuments();
  const students = await Student.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  const totalPages = Math.ceil(total / limit);

  return {
    code: HTTP_STATUS.OK,
    message: STATUS_MESSAGE[HTTP_STATUS.OK],
    data: {
      students,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    },
  };
};

export const getStudentByIdService = async (id) => {
  const student = await Student.findById(id);

  if (!student) {
    return {
      code: HTTP_STATUS.NOT_FOUND,
      message: STATUS_MESSAGE[HTTP_STATUS.NOT_FOUND],
    };
  }

  return {
    code: HTTP_STATUS.OK,
    message: STATUS_MESSAGE[HTTP_STATUS.OK],
    data: student,
  };
};

export const updateStudentService = async (id, data) => {
  const student = await Student.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  if (!student) {
    return {
      code: HTTP_STATUS.NOT_FOUND,
      message: STATUS_MESSAGE[HTTP_STATUS.NOT_FOUND],
    };
  }

  return {
    code: HTTP_STATUS.OK,
    message: STATUS_MESSAGE[HTTP_STATUS.OK],
    data: student,
  };
};

export const deleteStudentService = async (id) => {
  const student = await Student.findByIdAndDelete(id);

  if (!student) {
    return {
      code: HTTP_STATUS.NOT_FOUND,
      message: STATUS_MESSAGE[HTTP_STATUS.NOT_FOUND],
    };
  }

  return {
    code: HTTP_STATUS.OK,
    message: STATUS_MESSAGE[HTTP_STATUS.OK],
  };
};

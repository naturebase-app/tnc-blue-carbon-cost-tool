import { initContract } from "@ts-rest/core";
import { CreateUserSchema } from "@shared/schemas/users/create-user.schema";
import { UploadFileSchema } from "@shared/schemas/admin/upload-file.schema";
import { z } from "zod";

// TODO: This is a scaffold. We need to define types for responses, zod schemas for body and query param validation etc.

const contract = initContract();
export type UserStatistics = {
  activeUsers: number;
  usersCreatedLast90Days: number;
  savedCustomProjects: number;
  customProjectsUpdatedLast90Days: number;
};

export const UserEmailCategorySchema = z.enum([
  "all",
  "active",
  "saved-projects",
]);
export type UserEmailCategory = z.infer<typeof UserEmailCategorySchema>;

export const UserEmailCategoriesQuerySchema = z.object({
  categories: z
    .string()
    .transform((value) => (value ? value.split(",") : []))
    .pipe(z.array(UserEmailCategorySchema))
    .optional(),
});

export const adminContract = contract.router({
  listUserEmails: {
    method: "GET",
    path: "/admin/users/emails",
    query: UserEmailCategoriesQuerySchema,
    responses: {
      200: contract.type<{ data: string[] }>(),
    },
  },
  getUserStatistics: {
    method: "GET",
    path: "/admin/users/statistics",
    responses: {
      200: contract.type<{ data: UserStatistics }>(),
    },
  },
  addUser: {
    method: "POST",
    path: "/admin/users",
    responses: {
      201: contract.type<null>(),
    },
    body: CreateUserSchema,
  },
  uploadFile: {
    method: "POST",
    path: "/admin/upload/xlsx",
    responses: {
      201: contract.type<any>(),
    },
    body: UploadFileSchema,
  },
  uploadProjectScorecard: {
    method: "POST",
    path: "/admin/upload/scorecard",
    responses: {
      201: contract.type<any>(),
    },
    body: contract.type<any>(),
  },
  downloadDataIngestionFile: {
    method: "GET",
    path: "/admin/data-ingestion/:createdAt/download",
    pathParams: z.object({
      createdAt: z.string(),
    }),
    responses: {
      200: contract.type<Buffer>(),
      404: contract.type<{ message: string }>(),
    },
  },
});

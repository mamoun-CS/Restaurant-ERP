--
-- PostgreSQL database dump
--

\restrict SsVHpFkJQ6B9l3ol69I0aZhSfWYJyUwZrCRklPf8VJY1BcHzklXEABT1MbUAdK2

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

-- Started on 2026-10-22 10:17:39

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 1068 (class 1247 OID 447928)
-- Name: CashAdjustmentType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."CashAdjustmentType" AS ENUM (
    'CORRECTION',
    'REVERSAL',
    'MANAGER_ADJUSTMENT'
);


ALTER TYPE public."CashAdjustmentType" OWNER TO postgres;

--
-- TOC entry 984 (class 1247 OID 445819)
-- Name: CashShiftStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."CashShiftStatus" AS ENUM (
    'OPEN',
    'CLOSED',
    'CLOSING_PENDING',
    'REVIEW_REQUIRED',
    'APPROVED',
    'REJECTED',
    'FORCE_CLOSED'
);


ALTER TYPE public."CashShiftStatus" OWNER TO postgres;

--
-- TOC entry 1077 (class 1247 OID 447960)
-- Name: DeliveryStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."DeliveryStatus" AS ENUM (
    'PENDING',
    'ASSIGNED',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED'
);


ALTER TYPE public."DeliveryStatus" OWNER TO postgres;

--
-- TOC entry 909 (class 1247 OID 423826)
-- Name: DiscountType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."DiscountType" AS ENUM (
    'FIXED',
    'PERCENTAGE'
);


ALTER TYPE public."DiscountType" OWNER TO postgres;

--
-- TOC entry 1062 (class 1247 OID 447910)
-- Name: ExpenseApprovalStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ExpenseApprovalStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'REVERSED'
);


ALTER TYPE public."ExpenseApprovalStatus" OWNER TO postgres;

--
-- TOC entry 963 (class 1247 OID 432572)
-- Name: ExpenseCategory; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ExpenseCategory" AS ENUM (
    'RENT',
    'SALARIES',
    'ELECTRICITY',
    'WATER',
    'INTERNET',
    'MAINTENANCE',
    'MARKETING',
    'DELIVERY',
    'EQUIPMENT',
    'OTHER'
);


ALTER TYPE public."ExpenseCategory" OWNER TO postgres;

--
-- TOC entry 966 (class 1247 OID 432594)
-- Name: ExpenseFrequency; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ExpenseFrequency" AS ENUM (
    'ONE_TIME',
    'DAILY',
    'WEEKLY',
    'MONTHLY',
    'RECURRING'
);


ALTER TYPE public."ExpenseFrequency" OWNER TO postgres;

--
-- TOC entry 1059 (class 1247 OID 447902)
-- Name: ExpenseSource; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ExpenseSource" AS ENUM (
    'CASH_REGISTER',
    'BANK',
    'EXTERNAL_CASH'
);


ALTER TYPE public."ExpenseSource" OWNER TO postgres;

--
-- TOC entry 915 (class 1247 OID 423836)
-- Name: InvoiceStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."InvoiceStatus" AS ENUM (
    'COMPLETED',
    'VOIDED',
    'UNPAID',
    'PARTIALLY_PAID',
    'PAID',
    'REFUNDED',
    'PARTIALLY_REFUNDED'
);


ALTER TYPE public."InvoiceStatus" OWNER TO postgres;

--
-- TOC entry 990 (class 1247 OID 445840)
-- Name: KitchenOrderStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."KitchenOrderStatus" AS ENUM (
    'NEW',
    'PREPARING',
    'READY',
    'DELIVERED',
    'CANCELLED'
);


ALTER TYPE public."KitchenOrderStatus" OWNER TO postgres;

--
-- TOC entry 1065 (class 1247 OID 447920)
-- Name: OpeningBalanceSource; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."OpeningBalanceSource" AS ENUM (
    'PREVIOUS_SHIFT_CARRYOVER',
    'MANAGER_ADDITION',
    'MIXED'
);


ALTER TYPE public."OpeningBalanceSource" OWNER TO postgres;

--
-- TOC entry 993 (class 1247 OID 445852)
-- Name: OrderType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."OrderType" AS ENUM (
    'DINE_IN',
    'PICKUP',
    'DELIVERY',
    'TAKEAWAY',
    'EMPLOYEE_ORDER',
    'HOSPITALITY',
    'COMPLIMENTARY'
);


ALTER TYPE public."OrderType" OWNER TO postgres;

--
-- TOC entry 1122 (class 1247 OID 465298)
-- Name: PaperWidth; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaperWidth" AS ENUM (
    'W58',
    'W80',
    'A4',
    'CUSTOM'
);


ALTER TYPE public."PaperWidth" OWNER TO postgres;

--
-- TOC entry 912 (class 1247 OID 423832)
-- Name: PaymentMethod; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentMethod" AS ENUM (
    'CASH',
    'CREDIT_CARD',
    'BANK'
);


ALTER TYPE public."PaymentMethod" OWNER TO postgres;

--
-- TOC entry 1050 (class 1247 OID 447868)
-- Name: PaymentSource; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentSource" AS ENUM (
    'CASH_REGISTER',
    'BANK',
    'EXTERNAL_CASH'
);


ALTER TYPE public."PaymentSource" OWNER TO postgres;

--
-- TOC entry 1071 (class 1247 OID 447936)
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'COMPLETED',
    'FAILED',
    'VOIDED',
    'REFUNDED',
    'PARTIALLY_REFUNDED'
);


ALTER TYPE public."PaymentStatus" OWNER TO postgres;

--
-- TOC entry 978 (class 1247 OID 432681)
-- Name: PayrollStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PayrollStatus" AS ENUM (
    'UNPAID',
    'PARTIALLY_PAID',
    'PAID'
);


ALTER TYPE public."PayrollStatus" OWNER TO postgres;

--
-- TOC entry 1128 (class 1247 OID 465322)
-- Name: PrintContentType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PrintContentType" AS ENUM (
    'HTML',
    'ESC_POS'
);


ALTER TYPE public."PrintContentType" OWNER TO postgres;

--
-- TOC entry 1116 (class 1247 OID 465279)
-- Name: PrintDeviceStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PrintDeviceStatus" AS ENUM (
    'ONLINE',
    'OFFLINE',
    'DISABLED'
);


ALTER TYPE public."PrintDeviceStatus" OWNER TO postgres;

--
-- TOC entry 1131 (class 1247 OID 465328)
-- Name: PrintJobStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PrintJobStatus" AS ENUM (
    'PENDING',
    'SENT',
    'PROCESSING',
    'PRINTED',
    'FAILED',
    'CANCELLED'
);


ALTER TYPE public."PrintJobStatus" OWNER TO postgres;

--
-- TOC entry 1125 (class 1247 OID 465308)
-- Name: PrintJobType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PrintJobType" AS ENUM (
    'CUSTOMER_RECEIPT',
    'KITCHEN_TICKET',
    'BAR_TICKET',
    'SHIFT_CLOSE_REPORT',
    'LABEL',
    'TEST_PRINT',
    'OPEN_CASH_DRAWER'
);


ALTER TYPE public."PrintJobType" OWNER TO postgres;

--
-- TOC entry 1119 (class 1247 OID 465286)
-- Name: PrinterType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PrinterType" AS ENUM (
    'CASHIER',
    'KITCHEN',
    'BAR',
    'LABEL',
    'REPORT'
);


ALTER TYPE public."PrinterType" OWNER TO postgres;

--
-- TOC entry 1047 (class 1247 OID 447853)
-- Name: PurchaseInvoiceStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PurchaseInvoiceStatus" AS ENUM (
    'DRAFT',
    'UNPAID',
    'PARTIALLY_PAID',
    'PAID',
    'CANCELLED',
    'RETURNED',
    'PARTIALLY_RETURNED'
);


ALTER TYPE public."PurchaseInvoiceStatus" OWNER TO postgres;

--
-- TOC entry 1056 (class 1247 OID 447888)
-- Name: PurchaseReturnStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PurchaseReturnStatus" AS ENUM (
    'DRAFT',
    'PENDING_APPROVAL',
    'APPROVED',
    'COMPLETED',
    'REJECTED',
    'CANCELLED'
);


ALTER TYPE public."PurchaseReturnStatus" OWNER TO postgres;

--
-- TOC entry 906 (class 1247 OID 423820)
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'ADMIN',
    'CASHIER'
);


ALTER TYPE public."Role" OWNER TO postgres;

--
-- TOC entry 1074 (class 1247 OID 447950)
-- Name: SettlementStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."SettlementStatus" AS ENUM (
    'UNSETTLED',
    'PARTIALLY_SETTLED',
    'SETTLED',
    'DISPUTED'
);


ALTER TYPE public."SettlementStatus" OWNER TO postgres;

--
-- TOC entry 987 (class 1247 OID 445824)
-- Name: ShiftReportReviewStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ShiftReportReviewStatus" AS ENUM (
    'NEW',
    'PENDING_REVIEW',
    'REVIEWED',
    'MATCHED',
    'SHORTAGE_UNDER_INVESTIGATION',
    'ACCEPTED_DIFFERENCE',
    'PERMANENTLY_CLOSED'
);


ALTER TYPE public."ShiftReportReviewStatus" OWNER TO postgres;

--
-- TOC entry 1053 (class 1247 OID 447876)
-- Name: SupplierPaymentMethod; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."SupplierPaymentMethod" AS ENUM (
    'CASH',
    'BANK_TRANSFER',
    'CARD',
    'CHEQUE',
    'OTHER'
);


ALTER TYPE public."SupplierPaymentMethod" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 231 (class 1259 OID 424021)
-- Name: AuditLog; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AuditLog" (
    id text NOT NULL,
    "userId" text,
    action text NOT NULL,
    "entityType" text NOT NULL,
    "entityId" text,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deviceInfo" text,
    "ipAddress" text,
    "newData" jsonb,
    "previousData" jsonb,
    "approvalReference" text,
    "branchId" text,
    reason text,
    "requestId" text
);


ALTER TABLE public."AuditLog" OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 423841)
-- Name: Branch; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Branch" (
    id text NOT NULL,
    name text NOT NULL,
    "nameAr" text NOT NULL,
    code text NOT NULL,
    address text,
    active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Branch" OWNER TO postgres;

--
-- TOC entry 265 (class 1259 OID 448224)
-- Name: CashAdjustment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CashAdjustment" (
    id text NOT NULL,
    "shiftId" text NOT NULL,
    type public."CashAdjustmentType" NOT NULL,
    amount numeric(14,2) NOT NULL,
    "currencyCode" text NOT NULL,
    reason text NOT NULL,
    "createdById" text NOT NULL,
    "approvedById" text,
    "beforeValue" jsonb NOT NULL,
    "afterValue" jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."CashAdjustment" OWNER TO postgres;

--
-- TOC entry 254 (class 1259 OID 446138)
-- Name: CashNotification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CashNotification" (
    id text NOT NULL,
    "shiftId" text,
    "userId" text,
    type text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    metadata jsonb,
    "readAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."CashNotification" OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 445914)
-- Name: CashRegister; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CashRegister" (
    id text NOT NULL,
    name text NOT NULL,
    number text NOT NULL,
    "branchId" text NOT NULL,
    active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CashRegister" OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 445930)
-- Name: CashShift; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CashShift" (
    id text NOT NULL,
    "shiftNumber" text NOT NULL,
    status public."CashShiftStatus" DEFAULT 'OPEN'::public."CashShiftStatus" NOT NULL,
    "branchId" text NOT NULL,
    "registerId" text NOT NULL,
    "employeeId" text NOT NULL,
    "openedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "closedAt" timestamp(3) without time zone,
    "openingTotalBase" numeric(14,2) DEFAULT 0 NOT NULL,
    "actualClosingTotalBase" numeric(14,2),
    "expectedClosingTotalBase" numeric(14,2),
    "differenceTotalBase" numeric(14,2),
    "openingRates" jsonb NOT NULL,
    "closingRates" jsonb,
    "previousShiftId" text,
    "employeeClosingNote" text,
    "managerPrivateNote" text,
    "managerEmployeeNote" text,
    "reviewStatus" public."ShiftReportReviewStatus" DEFAULT 'NEW'::public."ShiftReportReviewStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "managerAdditionBase" numeric(14,2) DEFAULT 0 NOT NULL,
    "managerAdditionById" text,
    "openingBalanceSource" public."OpeningBalanceSource" DEFAULT 'PREVIOUS_SHIFT_CARRYOVER'::public."OpeningBalanceSource" NOT NULL,
    "openingDiscrepancyBase" numeric(14,2) DEFAULT 0 NOT NULL,
    "openingNote" text,
    "posDeviceId" text,
    "previousCarryoverBase" numeric(14,2) DEFAULT 0 NOT NULL
);


ALTER TABLE public."CashShift" OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 423874)
-- Name: Category; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Category" (
    id text NOT NULL,
    "nameEn" text NOT NULL,
    "nameAr" text NOT NULL,
    active boolean DEFAULT true NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "deletedBy" text
);


ALTER TABLE public."Category" OWNER TO postgres;

--
-- TOC entry 271 (class 1259 OID 465412)
-- Name: CategoryPrinterRoute; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CategoryPrinterRoute" (
    id text NOT NULL,
    "categoryId" text NOT NULL,
    "printerConfigurationId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CategoryPrinterRoute" OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 445865)
-- Name: Currency; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Currency" (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    "nameAr" text,
    "isBase" boolean DEFAULT false NOT NULL,
    active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Currency" OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 445896)
-- Name: CurrencyDenomination; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CurrencyDenomination" (
    id text NOT NULL,
    "currencyId" text NOT NULL,
    value numeric(12,2) NOT NULL,
    label text NOT NULL,
    active boolean DEFAULT true NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CurrencyDenomination" OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 423942)
-- Name: DiscountCampaign; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."DiscountCampaign" (
    id text NOT NULL,
    "nameEn" text NOT NULL,
    "nameAr" text NOT NULL,
    type public."DiscountType" NOT NULL,
    value numeric(10,2) NOT NULL,
    "startsAt" timestamp(3) without time zone NOT NULL,
    "endsAt" timestamp(3) without time zone NOT NULL,
    active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."DiscountCampaign" OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 445882)
-- Name: ExchangeRate; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ExchangeRate" (
    id text NOT NULL,
    "currencyId" text NOT NULL,
    "rateToBase" numeric(12,6) NOT NULL,
    "previousRate" numeric(12,6),
    "managerId" text,
    active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ExchangeRate" OWNER TO postgres;

--
-- TOC entry 256 (class 1259 OID 448050)
-- Name: ExpenseCategoryMaster; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ExpenseCategoryMaster" (
    id text NOT NULL,
    "nameEn" text NOT NULL,
    "nameAr" text NOT NULL,
    active boolean DEFAULT true NOT NULL,
    "requiresApproval" boolean DEFAULT false NOT NULL,
    "cashierLimit" numeric(12,2) DEFAULT 0 NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "deletedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ExpenseCategoryMaster" OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 432611)
-- Name: Ingredient; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Ingredient" (
    id text NOT NULL,
    "nameEn" text NOT NULL,
    "nameAr" text NOT NULL,
    unit text NOT NULL,
    "purchaseCost" numeric(10,4) NOT NULL,
    "purchaseQty" numeric(10,4) NOT NULL,
    "unitCost" numeric(10,4) NOT NULL,
    active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Ingredient" OWNER TO postgres;

--
-- TOC entry 264 (class 1259 OID 448208)
-- Name: InventoryMovement; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."InventoryMovement" (
    id text NOT NULL,
    "productId" text,
    "branchId" text NOT NULL,
    quantity numeric(14,4) NOT NULL,
    unit text NOT NULL,
    "movementType" text NOT NULL,
    "referenceType" text NOT NULL,
    "referenceId" text NOT NULL,
    notes text,
    "createdById" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."InventoryMovement" OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 423961)
-- Name: Invoice; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Invoice" (
    id text NOT NULL,
    number text NOT NULL,
    status public."InvoiceStatus" DEFAULT 'COMPLETED'::public."InvoiceStatus" NOT NULL,
    subtotal numeric(12,2) NOT NULL,
    "discountAmount" numeric(12,2) DEFAULT 0 NOT NULL,
    "totalAmount" numeric(12,2) NOT NULL,
    "paymentMethod" public."PaymentMethod" DEFAULT 'CASH'::public."PaymentMethod" NOT NULL,
    "cashierId" text NOT NULL,
    "branchId" text NOT NULL,
    "discountId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "shiftId" text,
    "cancellationReason" text,
    "clientTransactionId" text,
    "idempotencyKey" text,
    "officialNumber" text,
    "orderType" public."OrderType" DEFAULT 'PICKUP'::public."OrderType" NOT NULL,
    "voidApprovedAt" timestamp(3) without time zone,
    "voidApprovedById" text,
    "voidRequestedAt" timestamp(3) without time zone,
    "voidRequestedById" text,
    "customerAddress" text,
    "customerName" text,
    "customerNotes" text,
    "customerPhone" text,
    "grandTotal" numeric(12,2) DEFAULT 0 NOT NULL,
    "taxAmount" numeric(12,2) DEFAULT 0 NOT NULL
);


ALTER TABLE public."Invoice" OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 423983)
-- Name: InvoiceItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."InvoiceItem" (
    id text NOT NULL,
    "invoiceId" text NOT NULL,
    "productId" text,
    "categoryId" text,
    "productNameSnapshot" text NOT NULL,
    quantity integer NOT NULL,
    "unitPrice" numeric(10,2) NOT NULL,
    "selectedSizeSnapshot" text,
    "totalPrice" numeric(12,2) NOT NULL,
    "totalCostSnapshot" numeric(12,2) DEFAULT 0 NOT NULL,
    "unitCostSnapshot" numeric(10,2) DEFAULT 0 NOT NULL
);


ALTER TABLE public."InvoiceItem" OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 423996)
-- Name: InvoiceItemAddon; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."InvoiceItemAddon" (
    id text NOT NULL,
    "invoiceItemId" text NOT NULL,
    "nameSnapshot" text NOT NULL,
    "priceSnapshot" numeric(10,2) NOT NULL
);


ALTER TABLE public."InvoiceItemAddon" OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 446010)
-- Name: InvoicePayment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."InvoicePayment" (
    id text NOT NULL,
    "invoiceId" text NOT NULL,
    "shiftId" text,
    method public."PaymentMethod" NOT NULL,
    "currencyId" text NOT NULL,
    "currencyCode" text NOT NULL,
    amount numeric(14,2) NOT NULL,
    "exchangeRateToBase" numeric(12,6) NOT NULL,
    "convertedAmountBase" numeric(14,2) NOT NULL,
    provider text,
    "changeCurrencyCode" text,
    "changeAmount" numeric(14,2) DEFAULT 0 NOT NULL,
    "paidAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "bankFee" numeric(14,2) DEFAULT 0 NOT NULL,
    "bankName" text,
    "cardType" text,
    "lastFourDigits" text,
    "posTerminalNumber" text,
    "settlementDate" timestamp(3) without time zone,
    "settlementStatus" public."SettlementStatus" DEFAULT 'UNSETTLED'::public."SettlementStatus" NOT NULL,
    status public."PaymentStatus" DEFAULT 'COMPLETED'::public."PaymentStatus" NOT NULL,
    "transactionAt" timestamp(3) without time zone,
    "transactionReference" text,
    "voidReason" text,
    "voidedById" text
);


ALTER TABLE public."InvoicePayment" OWNER TO postgres;

--
-- TOC entry 266 (class 1259 OID 448242)
-- Name: InvoiceSequence; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."InvoiceSequence" (
    id text NOT NULL,
    "branchId" text NOT NULL,
    "registerId" text NOT NULL,
    year integer NOT NULL,
    "lastNumber" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."InvoiceSequence" OWNER TO postgres;

--
-- TOC entry 252 (class 1259 OID 446103)
-- Name: KitchenOrder; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."KitchenOrder" (
    id text NOT NULL,
    "orderNumber" text NOT NULL,
    "invoiceId" text NOT NULL,
    "branchId" text NOT NULL,
    "cashierName" text NOT NULL,
    "orderType" public."OrderType" DEFAULT 'PICKUP'::public."OrderType" NOT NULL,
    status public."KitchenOrderStatus" DEFAULT 'NEW'::public."KitchenOrderStatus" NOT NULL,
    "showPrices" boolean DEFAULT false NOT NULL,
    items jsonb NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."KitchenOrder" OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 432644)
-- Name: OperatingExpense; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."OperatingExpense" (
    id text NOT NULL,
    title text NOT NULL,
    category public."ExpenseCategory" NOT NULL,
    frequency public."ExpenseFrequency" DEFAULT 'ONE_TIME'::public."ExpenseFrequency" NOT NULL,
    amount numeric(12,2) NOT NULL,
    "expenseDate" timestamp(3) without time zone NOT NULL,
    notes text,
    active boolean DEFAULT true NOT NULL,
    "branchId" text,
    "createdById" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "invoiceName" text,
    "invoiceUrl" text,
    "payrollRecordId" text,
    "approvalDate" timestamp(3) without time zone,
    "approvalStatus" public."ExpenseApprovalStatus" DEFAULT 'APPROVED'::public."ExpenseApprovalStatus" NOT NULL,
    "approvedById" text,
    "currencyCode" text DEFAULT 'ILS'::text NOT NULL,
    "exchangeRateToBase" numeric(12,6) DEFAULT 1 NOT NULL,
    "expenseCategoryId" text,
    "paymentMethod" public."SupplierPaymentMethod" DEFAULT 'CASH'::public."SupplierPaymentMethod" NOT NULL,
    "rejectionReason" text,
    "reversalOfId" text,
    source public."ExpenseSource" DEFAULT 'EXTERNAL_CASH'::public."ExpenseSource" NOT NULL,
    "supplierId" text
);


ALTER TABLE public."OperatingExpense" OWNER TO postgres;

--
-- TOC entry 255 (class 1259 OID 448037)
-- Name: PasswordResetToken; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PasswordResetToken" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "tokenHash" text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "usedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."PasswordResetToken" OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 424007)
-- Name: Payment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Payment" (
    id text NOT NULL,
    "invoiceId" text NOT NULL,
    method public."PaymentMethod" DEFAULT 'CASH'::public."PaymentMethod" NOT NULL,
    amount numeric(12,2) NOT NULL,
    "paidAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status public."PaymentStatus" DEFAULT 'COMPLETED'::public."PaymentStatus" NOT NULL
);


ALTER TABLE public."Payment" OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 432689)
-- Name: PayrollRecord; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PayrollRecord" (
    id text NOT NULL,
    "employeeId" text NOT NULL,
    "payrollMonth" timestamp(3) without time zone NOT NULL,
    "baseSalary" numeric(12,2) NOT NULL,
    overtime numeric(12,2) DEFAULT 0 NOT NULL,
    bonuses numeric(12,2) DEFAULT 0 NOT NULL,
    deductions numeric(12,2) DEFAULT 0 NOT NULL,
    advances numeric(12,2) DEFAULT 0 NOT NULL,
    "netSalary" numeric(12,2) NOT NULL,
    "amountPaid" numeric(12,2) DEFAULT 0 NOT NULL,
    status public."PayrollStatus" DEFAULT 'UNPAID'::public."PayrollStatus" NOT NULL,
    approved boolean DEFAULT false NOT NULL,
    "paymentDate" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."PayrollRecord" OWNER TO postgres;

--
-- TOC entry 267 (class 1259 OID 465341)
-- Name: PrintDevice; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PrintDevice" (
    id text NOT NULL,
    "branchId" text NOT NULL,
    name text NOT NULL,
    "deviceCode" text NOT NULL,
    "tokenHash" text NOT NULL,
    status public."PrintDeviceStatus" DEFAULT 'OFFLINE'::public."PrintDeviceStatus" NOT NULL,
    "operatingSystem" text,
    "appVersion" text,
    "localPrinters" jsonb,
    "lastConnectedAt" timestamp(3) without time zone,
    "lastHeartbeatAt" timestamp(3) without time zone,
    "disabledAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "sseStatus" text,
    "lastEventAt" timestamp(3) without time zone,
    "lastFallbackPollAt" timestamp(3) without time zone,
    "lastPrinterRefreshAt" timestamp(3) without time zone
);


ALTER TABLE public."PrintDevice" OWNER TO postgres;

--
-- TOC entry 272 (class 1259 OID 465425)
-- Name: PrintJob; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PrintJob" (
    id text NOT NULL,
    "branchId" text NOT NULL,
    "printDeviceId" text,
    "printerConfigurationId" text,
    "invoiceId" text,
    "kitchenOrderId" text,
    "originalPrintJobId" text,
    "jobType" public."PrintJobType" NOT NULL,
    "contentType" public."PrintContentType" DEFAULT 'HTML'::public."PrintContentType" NOT NULL,
    content text NOT NULL,
    copies integer DEFAULT 1 NOT NULL,
    "paperWidth" public."PaperWidth" DEFAULT 'W80'::public."PaperWidth" NOT NULL,
    "customWidthMm" integer,
    status public."PrintJobStatus" DEFAULT 'PENDING'::public."PrintJobStatus" NOT NULL,
    attempts integer DEFAULT 0 NOT NULL,
    "maxAttempts" integer DEFAULT 5 NOT NULL,
    "errorCode" text,
    "errorMessage" text,
    "idempotencyKey" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "sentAt" timestamp(3) without time zone,
    "processingAt" timestamp(3) without time zone,
    "printedAt" timestamp(3) without time zone,
    "failedAt" timestamp(3) without time zone,
    "cancelledAt" timestamp(3) without time zone,
    "cashDrawerOpened" boolean DEFAULT false NOT NULL,
    "drawerErrorCode" text,
    "drawerErrorMessage" text,
    "openCashDrawer" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."PrintJob" OWNER TO postgres;

--
-- TOC entry 268 (class 1259 OID 465358)
-- Name: PrintPairingCode; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PrintPairingCode" (
    id text NOT NULL,
    "branchId" text NOT NULL,
    "printDeviceId" text,
    "codeHash" text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "usedAt" timestamp(3) without time zone,
    attempts integer DEFAULT 0 NOT NULL,
    "createdById" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."PrintPairingCode" OWNER TO postgres;

--
-- TOC entry 269 (class 1259 OID 465373)
-- Name: PrinterConfiguration; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PrinterConfiguration" (
    id text NOT NULL,
    "branchId" text NOT NULL,
    "printDeviceId" text NOT NULL,
    "printerType" public."PrinterType" NOT NULL,
    "localPrinterName" text NOT NULL,
    "displayName" text NOT NULL,
    "paperWidth" public."PaperWidth" DEFAULT 'W80'::public."PaperWidth" NOT NULL,
    "customWidthMm" integer,
    copies integer DEFAULT 1 NOT NULL,
    "autoPrint" boolean DEFAULT true NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    "openCashDrawer" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "cashDrawerOpenBeforePrint" boolean DEFAULT true NOT NULL,
    "cashDrawerPin" integer DEFAULT 0 NOT NULL,
    "cashDrawerPulseOff" integer DEFAULT 250 NOT NULL,
    "cashDrawerPulseOn" integer DEFAULT 25 NOT NULL
);


ALTER TABLE public."PrinterConfiguration" OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 423891)
-- Name: Product; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Product" (
    id text NOT NULL,
    sku text NOT NULL,
    price numeric(10,2) NOT NULL,
    "imageUrl" text,
    active boolean DEFAULT true NOT NULL,
    "categoryId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "currentCost" numeric(10,2) DEFAULT 0 NOT NULL,
    "requiresPreparation" boolean DEFAULT true NOT NULL,
    barcode text,
    "deletedAt" timestamp(3) without time zone,
    "deletedBy" text
);


ALTER TABLE public."Product" OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 423930)
-- Name: ProductAddon; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ProductAddon" (
    id text NOT NULL,
    "nameEn" text NOT NULL,
    "nameAr" text NOT NULL,
    price numeric(10,2) NOT NULL,
    "productId" text NOT NULL
);


ALTER TABLE public."ProductAddon" OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 432630)
-- Name: ProductIngredient; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ProductIngredient" (
    id text NOT NULL,
    "productId" text NOT NULL,
    "ingredientId" text NOT NULL,
    "quantityUsed" numeric(10,4) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ProductIngredient" OWNER TO postgres;

--
-- TOC entry 270 (class 1259 OID 465399)
-- Name: ProductPrinterRoute; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ProductPrinterRoute" (
    id text NOT NULL,
    "productId" text NOT NULL,
    "printerConfigurationId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ProductPrinterRoute" OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 423918)
-- Name: ProductSize; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ProductSize" (
    id text NOT NULL,
    "nameEn" text NOT NULL,
    "nameAr" text NOT NULL,
    "priceDelta" numeric(10,2) NOT NULL,
    "productId" text NOT NULL
);


ALTER TABLE public."ProductSize" OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 423907)
-- Name: ProductTranslation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ProductTranslation" (
    id text NOT NULL,
    locale text NOT NULL,
    name text NOT NULL,
    description text,
    "productId" text NOT NULL
);


ALTER TABLE public."ProductTranslation" OWNER TO postgres;

--
-- TOC entry 258 (class 1259 OID 448087)
-- Name: PurchaseInvoice; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PurchaseInvoice" (
    id text NOT NULL,
    "internalNumber" text NOT NULL,
    "officialNumber" text NOT NULL,
    "supplierId" text NOT NULL,
    "branchId" text NOT NULL,
    "purchaseDate" timestamp(3) without time zone NOT NULL,
    "dueDate" timestamp(3) without time zone,
    "currencyCode" text NOT NULL,
    "exchangeRateToBase" numeric(12,6) NOT NULL,
    subtotal numeric(14,2) DEFAULT 0 NOT NULL,
    discount numeric(14,2) DEFAULT 0 NOT NULL,
    tax numeric(14,2) DEFAULT 0 NOT NULL,
    "additionalCosts" numeric(14,2) DEFAULT 0 NOT NULL,
    total numeric(14,2) DEFAULT 0 NOT NULL,
    "paidAmount" numeric(14,2) DEFAULT 0 NOT NULL,
    "remainingAmount" numeric(14,2) DEFAULT 0 NOT NULL,
    status public."PurchaseInvoiceStatus" DEFAULT 'DRAFT'::public."PurchaseInvoiceStatus" NOT NULL,
    notes text,
    "attachmentUrl" text,
    "createdById" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."PurchaseInvoice" OWNER TO postgres;

--
-- TOC entry 259 (class 1259 OID 448122)
-- Name: PurchaseInvoiceItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PurchaseInvoiceItem" (
    id text NOT NULL,
    "purchaseInvoiceId" text NOT NULL,
    "productId" text,
    "itemNameSnapshot" text NOT NULL,
    quantity numeric(14,4) NOT NULL,
    unit text NOT NULL,
    "unitPurchasePrice" numeric(14,4) NOT NULL,
    discount numeric(14,2) DEFAULT 0 NOT NULL,
    tax numeric(14,2) DEFAULT 0 NOT NULL,
    total numeric(14,2) NOT NULL,
    "batchNumber" text,
    "expirationDate" timestamp(3) without time zone,
    "returnedQuantity" numeric(14,4) DEFAULT 0 NOT NULL
);


ALTER TABLE public."PurchaseInvoiceItem" OWNER TO postgres;

--
-- TOC entry 263 (class 1259 OID 448194)
-- Name: PurchasePriceHistory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PurchasePriceHistory" (
    id text NOT NULL,
    "productId" text NOT NULL,
    "purchaseInvoiceId" text,
    "unitCost" numeric(14,4) NOT NULL,
    "currencyCode" text NOT NULL,
    "exchangeRateToBase" numeric(12,6) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."PurchasePriceHistory" OWNER TO postgres;

--
-- TOC entry 261 (class 1259 OID 448161)
-- Name: PurchaseReturn; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PurchaseReturn" (
    id text NOT NULL,
    "supplierId" text NOT NULL,
    "purchaseInvoiceId" text NOT NULL,
    reason text NOT NULL,
    "returnDate" timestamp(3) without time zone NOT NULL,
    "refundMethod" public."SupplierPaymentMethod" NOT NULL,
    "refundAmount" numeric(14,2) DEFAULT 0 NOT NULL,
    "createdById" text NOT NULL,
    "approvedById" text,
    status public."PurchaseReturnStatus" DEFAULT 'DRAFT'::public."PurchaseReturnStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."PurchaseReturn" OWNER TO postgres;

--
-- TOC entry 262 (class 1259 OID 448182)
-- Name: PurchaseReturnItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PurchaseReturnItem" (
    id text NOT NULL,
    "purchaseReturnId" text NOT NULL,
    "purchaseInvoiceItemId" text NOT NULL,
    quantity numeric(14,4) NOT NULL,
    "unitCost" numeric(14,4) NOT NULL,
    reason text
);


ALTER TABLE public."PurchaseReturnItem" OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 445997)
-- Name: ShiftCashCarryover; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ShiftCashCarryover" (
    id text NOT NULL,
    "shiftId" text NOT NULL,
    "currencyCode" text NOT NULL,
    amount numeric(14,2) NOT NULL,
    "denominationBreakdown" jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ShiftCashCarryover" OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 445984)
-- Name: ShiftCashWithdrawal; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ShiftCashWithdrawal" (
    id text NOT NULL,
    "shiftId" text NOT NULL,
    "currencyCode" text NOT NULL,
    amount numeric(14,2) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ShiftCashWithdrawal" OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 445967)
-- Name: ShiftClosingDenomination; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ShiftClosingDenomination" (
    id text NOT NULL,
    "shiftId" text NOT NULL,
    "currencyCode" text NOT NULL,
    "denominationValue" numeric(12,2) NOT NULL,
    "availableQty" integer NOT NULL,
    "withdrawnQty" integer NOT NULL,
    "remainingQty" integer NOT NULL,
    "totalAmount" numeric(14,2) NOT NULL,
    "withdrawnAmount" numeric(14,2) NOT NULL,
    "remainingAmount" numeric(14,2) NOT NULL
);


ALTER TABLE public."ShiftClosingDenomination" OWNER TO postgres;

--
-- TOC entry 250 (class 1259 OID 446070)
-- Name: ShiftDiscrepancy; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ShiftDiscrepancy" (
    id text NOT NULL,
    "shiftId" text NOT NULL,
    "currencyCode" text NOT NULL,
    "expectedAmount" numeric(14,2) NOT NULL,
    "actualAmount" numeric(14,2) NOT NULL,
    "differenceAmount" numeric(14,2) NOT NULL,
    "differenceBase" numeric(14,2) NOT NULL,
    note text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ShiftDiscrepancy" OWNER TO postgres;

--
-- TOC entry 248 (class 1259 OID 446029)
-- Name: ShiftExpense; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ShiftExpense" (
    id text NOT NULL,
    "shiftId" text NOT NULL,
    category public."ExpenseCategory" NOT NULL,
    amount numeric(14,2) NOT NULL,
    "currencyId" text NOT NULL,
    "currencyCode" text NOT NULL,
    "exchangeRateToBase" numeric(12,6) NOT NULL,
    "convertedAmountBase" numeric(14,2) NOT NULL,
    reason text NOT NULL,
    notes text,
    "receiptUrl" text,
    "employeeId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "cancelledAt" timestamp(3) without time zone,
    "approvalDate" timestamp(3) without time zone,
    "approvalStatus" public."ExpenseApprovalStatus" DEFAULT 'APPROVED'::public."ExpenseApprovalStatus" NOT NULL,
    "approvedById" text,
    "expenseCategoryId" text,
    "rejectionReason" text,
    "reversalOfId" text,
    source public."ExpenseSource" DEFAULT 'CASH_REGISTER'::public."ExpenseSource" NOT NULL,
    "supplierId" text
);


ALTER TABLE public."ShiftExpense" OWNER TO postgres;

--
-- TOC entry 251 (class 1259 OID 446087)
-- Name: ShiftHandoverDiscrepancy; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ShiftHandoverDiscrepancy" (
    id text NOT NULL,
    "shiftId" text NOT NULL,
    "previousShiftId" text,
    "currencyCode" text NOT NULL,
    "carryoverAmount" numeric(14,2) NOT NULL,
    "actualOpeningAmount" numeric(14,2) NOT NULL,
    "differenceAmount" numeric(14,2) NOT NULL,
    "denominationDifferences" jsonb,
    note text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ShiftHandoverDiscrepancy" OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 445954)
-- Name: ShiftOpeningDenomination; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ShiftOpeningDenomination" (
    id text NOT NULL,
    "shiftId" text NOT NULL,
    "currencyCode" text NOT NULL,
    "denominationValue" numeric(12,2) NOT NULL,
    quantity integer NOT NULL,
    "totalAmount" numeric(14,2) NOT NULL
);


ALTER TABLE public."ShiftOpeningDenomination" OWNER TO postgres;

--
-- TOC entry 253 (class 1259 OID 446125)
-- Name: ShiftReport; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ShiftReport" (
    id text NOT NULL,
    "shiftId" text NOT NULL,
    reference text NOT NULL,
    "reportData" jsonb NOT NULL,
    "pdfUrl" text,
    "generatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "generatedById" text
);


ALTER TABLE public."ShiftReport" OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 446048)
-- Name: ShiftReturn; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ShiftReturn" (
    id text NOT NULL,
    "shiftId" text NOT NULL,
    "originalInvoiceNumber" text NOT NULL,
    "returnNumber" text NOT NULL,
    "returnedItems" jsonb NOT NULL,
    amount numeric(14,2) NOT NULL,
    "currencyId" text NOT NULL,
    "currencyCode" text NOT NULL,
    "exchangeRateToBase" numeric(12,6) NOT NULL,
    "convertedAmountBase" numeric(14,2) NOT NULL,
    "refundMethod" public."PaymentMethod" NOT NULL,
    reason text NOT NULL,
    "employeeId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ShiftReturn" OWNER TO postgres;

--
-- TOC entry 257 (class 1259 OID 448071)
-- Name: Supplier; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Supplier" (
    id text NOT NULL,
    name text NOT NULL,
    "contactPerson" text,
    phone text,
    email text,
    address text,
    "taxNumber" text,
    notes text,
    "currentBalance" numeric(14,2) DEFAULT 0 NOT NULL,
    active boolean DEFAULT true NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "deletedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Supplier" OWNER TO postgres;

--
-- TOC entry 260 (class 1259 OID 448142)
-- Name: SupplierPayment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SupplierPayment" (
    id text NOT NULL,
    "supplierId" text NOT NULL,
    "purchaseInvoiceId" text,
    "branchId" text NOT NULL,
    amount numeric(14,2) NOT NULL,
    "currencyCode" text NOT NULL,
    "exchangeRateToBase" numeric(12,6) NOT NULL,
    source public."PaymentSource" NOT NULL,
    method public."SupplierPaymentMethod" NOT NULL,
    "accountName" text,
    "referenceNumber" text,
    "paymentDate" timestamp(3) without time zone NOT NULL,
    notes text,
    "attachmentUrl" text,
    "createdById" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."SupplierPayment" OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 423857)
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    "passwordHash" text NOT NULL,
    role public."Role" NOT NULL,
    active boolean DEFAULT true NOT NULL,
    "branchId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "baseSalary" numeric(12,2) DEFAULT 0 NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "deletedBy" text,
    "failedLoginCount" integer DEFAULT 0 NOT NULL,
    "forcePasswordChange" boolean DEFAULT false NOT NULL,
    "lastLoginAt" timestamp(3) without time zone,
    "lockedUntil" timestamp(3) without time zone,
    "sessionVersion" integer DEFAULT 1 NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 424033)
-- Name: _DiscountCategories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_DiscountCategories" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_DiscountCategories" OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 424042)
-- Name: _DiscountProducts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_DiscountProducts" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_DiscountProducts" OWNER TO postgres;

--
-- TOC entry 273 (class 1259 OID 468620)
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- TOC entry 5743 (class 0 OID 424021)
-- Dependencies: 231
-- Data for Name: AuditLog; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AuditLog" (id, "userId", action, "entityType", "entityId", metadata, "createdAt", "deviceInfo", "ipAddress", "newData", "previousData", "approvalReference", "branchId", reason, "requestId") FROM stdin;
cmr97q8gn000irs9ncmlnhcz4	cmr97q8fk0002rs9nw154pmah	SEED_CREATED	System	\N	{"version": 1}	2026-07-06 12:45:10.103	\N	\N	\N	\N	\N	\N	\N	\N
cmre6rfvb000cjg9n58df8l4z	cmr97q8fk0002rs9nw154pmah	SEED_CREATED	System	\N	{"version": 1}	2026-07-10 00:16:57.623	\N	\N	\N	\N	\N	\N	\N	\N
cmrepqpfg0009049ncbawjnw9	cmr97q8fb0001rs9nulxof0w3	UPDATE	Product	cmr97q8gj000crs9ndrraxovw	\N	2026-07-10 09:08:16.06	\N	\N	\N	\N	\N	\N	\N	\N
cmreqa4m3000c049nyl6vt46g	cmr97q8fb0001rs9nulxof0w3	CREATE	Category	cmreqa4lz000b049nhicxd6v2	\N	2026-07-10 09:23:22.203	\N	\N	\N	\N	\N	\N	\N	\N
cmreqa4nc000e049n2472avor	cmr97q8fb0001rs9nulxof0w3	CREATE	Category	cmreqa4n9000d049nco8rhq0z	\N	2026-07-10 09:23:22.248	\N	\N	\N	\N	\N	\N	\N	\N
cmreqa4og000g049nip4ehu0b	cmr97q8fb0001rs9nulxof0w3	CREATE	Category	cmreqa4oc000f049nznkx4ysi	\N	2026-07-10 09:23:22.288	\N	\N	\N	\N	\N	\N	\N	\N
cmreqa4q2000i049ngzlqaxtu	cmr97q8fb0001rs9nulxof0w3	CREATE	Category	cmreqa4px000h049n7vl13o8w	\N	2026-07-10 09:23:22.346	\N	\N	\N	\N	\N	\N	\N	\N
cmreqa4rd000k049ntjq4idq4	cmr97q8fb0001rs9nulxof0w3	CREATE	Category	cmreqa4ra000j049nan25oz60	\N	2026-07-10 09:23:22.393	\N	\N	\N	\N	\N	\N	\N	\N
cmreqa4t2000m049ngw184wzl	cmr97q8fb0001rs9nulxof0w3	CREATE	Category	cmreqa4sy000l049nu122rf6g	\N	2026-07-10 09:23:22.454	\N	\N	\N	\N	\N	\N	\N	\N
cmreqa4ut000o049noq7hzydw	cmr97q8fb0001rs9nulxof0w3	CREATE	Category	cmreqa4up000n049n60qi7387	\N	2026-07-10 09:23:22.517	\N	\N	\N	\N	\N	\N	\N	\N
cmreqa4wd000q049nvwm11zyz	cmr97q8fb0001rs9nulxof0w3	CREATE	Category	cmreqa4wa000p049ntgs0wmlz	\N	2026-07-10 09:23:22.573	\N	\N	\N	\N	\N	\N	\N	\N
cmreqa4x8000s049nw48h5u7r	cmr97q8fb0001rs9nulxof0w3	CREATE	Category	cmreqa4x5000r049n85b5o8hc	\N	2026-07-10 09:23:22.604	\N	\N	\N	\N	\N	\N	\N	\N
cmropc0xq0012do9n41yw2c1x	cmr97q8fk0002rs9nw154pmah	SEED_CREATED	System	\N	{"version": 1}	2026-07-17 08:54:32.894	\N	\N	\N	\N	\N	\N	\N	\N
cmrp3ceco0001rw9n0mdgrt9x	\N	EXCHANGE_RATE_CHANGED	ExchangeRate	cmrp3cec40000rw9n9oxnrlgs	{"currencyCode": "USD"}	2026-07-17 15:26:44.904	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	{"id": "cmrp3cec40000rw9n9oxnrlgs", "active": true, "createdAt": "2026-07-17T15:26:44.884Z", "managerId": "cmr97q8fb0001rs9nulxof0w3", "currencyId": "cmropc0lp0002do9ndkrjww1o", "rateToBase": "3", "previousRate": "3.65"}	{"id": "cmropc0nb000odo9nkqi61c5a", "active": true, "createdAt": "2026-07-17T08:54:32.519Z", "managerId": null, "currencyId": "cmropc0lp0002do9ndkrjww1o", "rateToBase": "3.65", "previousRate": null}	\N	\N	\N	\N
cmrp3ck7f0003rw9nxxlrdmcg	\N	EXCHANGE_RATE_CHANGED	ExchangeRate	cmrp3ck780002rw9nzilh0b42	{"currencyCode": "JOD"}	2026-07-17 15:26:52.491	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	{"id": "cmrp3ck780002rw9nzilh0b42", "active": true, "createdAt": "2026-07-17T15:26:52.484Z", "managerId": "cmr97q8fb0001rs9nulxof0w3", "currencyId": "cmropc0ls0003do9nrps924og", "rateToBase": "4.1", "previousRate": "5.15"}	{"id": "cmropc0nd000pdo9nzn22e49v", "active": true, "createdAt": "2026-07-17T08:54:32.521Z", "managerId": null, "currencyId": "cmropc0ls0003do9nrps924og", "rateToBase": "5.15", "previousRate": null}	\N	\N	\N	\N
cmrp3jgqy000orw9n6hea9q8j	cmr97q8fk0002rs9nw154pmah	CASH_SHIFT_OPENED	CashShift	cmrp3jgpv0004rw9nanbdyo2l	{"counts": [{"quantity": 2, "currencyCode": "ILS", "denominationValue": 200}, {"quantity": 3, "currencyCode": "ILS", "denominationValue": 100}, {"quantity": 4, "currencyCode": "ILS", "denominationValue": 50}, {"quantity": 10, "currencyCode": "ILS", "denominationValue": 20}, {"quantity": 10, "currencyCode": "ILS", "denominationValue": 10}, {"quantity": 4, "currencyCode": "ILS", "denominationValue": 5}, {"quantity": 2, "currencyCode": "ILS", "denominationValue": 2}, {"quantity": 30, "currencyCode": "ILS", "denominationValue": 1}, {"quantity": 0, "currencyCode": "USD", "denominationValue": 100}, {"quantity": 0, "currencyCode": "USD", "denominationValue": 50}, {"quantity": 0, "currencyCode": "USD", "denominationValue": 20}, {"quantity": 0, "currencyCode": "USD", "denominationValue": 10}, {"quantity": 0, "currencyCode": "USD", "denominationValue": 5}, {"quantity": 0, "currencyCode": "USD", "denominationValue": 1}, {"quantity": 0, "currencyCode": "JOD", "denominationValue": 50}, {"quantity": 0, "currencyCode": "JOD", "denominationValue": 20}, {"quantity": 0, "currencyCode": "JOD", "denominationValue": 10}, {"quantity": 0, "currencyCode": "JOD", "denominationValue": 5}, {"quantity": 0, "currencyCode": "JOD", "denominationValue": 1}], "registerId": "cmropc0l50000do9nb75d0nfl"}	2026-07-17 15:32:14.603	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	{"id": "cmrp3jgpv0004rw9nanbdyo2l", "status": "OPEN", "branchId": "cmr97q88n0000rs9nh4sethxg", "closedAt": null, "openedAt": "2026-07-17T15:32:14.563Z", "createdAt": "2026-07-17T15:32:14.563Z", "updatedAt": "2026-07-17T15:32:14.563Z", "employeeId": "cmr97q8fk0002rs9nw154pmah", "registerId": "cmropc0l50000do9nb75d0nfl", "openingNote": null, "posDeviceId": null, "shiftNumber": "SH-302334527", "closingRates": null, "openingRates": [{"code": "ILS", "rateToBase": "1"}, {"code": "JOD", "rateToBase": "4.1"}, {"code": "USD", "rateToBase": "3"}], "reviewStatus": "NEW", "previousShiftId": null, "openingTotalBase": "1254", "managerPrivateNote": null, "differenceTotalBase": null, "employeeClosingNote": null, "managerAdditionBase": "0", "managerAdditionById": null, "managerEmployeeNote": null, "openingBalanceSource": "PREVIOUS_SHIFT_CARRYOVER", "previousCarryoverBase": "0", "actualClosingTotalBase": null, "openingDiscrepancyBase": "0", "expectedClosingTotalBase": null}	null	\N	\N	\N	\N
cmrp3qc41000zrw9nd1ilo913	cmr97q8fk0002rs9nw154pmah	INVOICE_CREATED	Invoice	cmrp3qc32000trw9nvfm9nwze	{"total": 27.25, "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "payments": [{"amount": 27.25, "method": "CASH", "changeAmount": 0, "currencyCode": "ILS"}]}	2026-07-17 15:37:35.185	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	{"id": "cmrp3qc32000trw9nvfm9nwze", "items": [{"id": "cmrp3qc3a000urw9n0vsitwvu", "addons": [], "quantity": 1, "invoiceId": "cmrp3qc32000trw9nvfm9nwze", "productId": null, "unitPrice": "7.75", "categoryId": null, "totalPrice": "7.75", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "سلطة حلوم", "selectedSizeSnapshot": null}, {"id": "cmrp3qc3d000vrw9nlk8hz7rp", "addons": [], "quantity": 1, "invoiceId": "cmrp3qc32000trw9nvfm9nwze", "productId": null, "unitPrice": "10.5", "categoryId": null, "totalPrice": "10.5", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "بيبروني حار", "selectedSizeSnapshot": "وسط"}, {"id": "cmrp3qc3e000wrw9n93dkvgzt", "addons": [], "quantity": 1, "invoiceId": "cmrp3qc32000trw9nvfm9nwze", "productId": null, "unitPrice": "9", "categoryId": null, "totalPrice": "9", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "مارغريتا", "selectedSizeSnapshot": "وسط"}], "number": "MAIN-REG-MAIN-01-2026-000001", "status": "PAID", "payment": {"id": "cmrp3qc3e000xrw9n10iq6na2", "amount": "27.25", "method": "CASH", "paidAt": "2026-07-17T15:37:35.150Z", "status": "COMPLETED", "invoiceId": "cmrp3qc32000trw9nvfm9nwze"}, "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "branchId": "cmr97q88n0000rs9nh4sethxg", "subtotal": "27.25", "cashierId": "cmr97q8fk0002rs9nw154pmah", "createdAt": "2026-07-17T15:37:35.150Z", "orderType": "PICKUP", "updatedAt": "2026-07-17T15:37:35.150Z", "discountId": null, "totalAmount": "27.25", "paymentMethod": "CASH", "discountAmount": "0", "idempotencyKey": null, "officialNumber": "MAIN-REG-MAIN-01-2026-000001", "voidApprovedAt": null, "voidRequestedAt": null, "voidApprovedById": null, "voidRequestedById": null, "cancellationReason": null, "clientTransactionId": null}	null	\N	\N	\N	\N
cmrp4dbfj0016rw9nnxcgjgxs	cmr97q8fk0002rs9nw154pmah	INVOICE_CREATED	Invoice	cmrp4dbe40011rw9ngdftx11c	{"total": 18.25, "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "payments": [{"amount": 18.25, "method": "CREDIT_CARD", "cardType": "VISA", "changeAmount": 0, "currencyCode": "ILS", "transactionReference": "POS-1784303726897"}]}	2026-07-17 15:55:27.391	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	{"id": "cmrp4dbe40011rw9ngdftx11c", "items": [{"id": "cmrp4dbel0012rw9nw1m6jvwm", "addons": [], "quantity": 1, "invoiceId": "cmrp4dbe40011rw9ngdftx11c", "productId": null, "unitPrice": "7.75", "categoryId": null, "totalPrice": "7.75", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "سلطة حلوم", "selectedSizeSnapshot": null}, {"id": "cmrp4dbev0013rw9nw31li7e5", "addons": [], "quantity": 1, "invoiceId": "cmrp4dbe40011rw9ngdftx11c", "productId": null, "unitPrice": "10.5", "categoryId": null, "totalPrice": "10.5", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "بيبروني حار", "selectedSizeSnapshot": "وسط"}], "number": "MAIN-REG-MAIN-01-2026-000002", "status": "PAID", "payment": {"id": "cmrp4dbew0014rw9nipj3xg5m", "amount": "18.25", "method": "CREDIT_CARD", "paidAt": "2026-07-17T15:55:27.340Z", "status": "COMPLETED", "invoiceId": "cmrp4dbe40011rw9ngdftx11c"}, "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "branchId": "cmr97q88n0000rs9nh4sethxg", "subtotal": "18.25", "cashierId": "cmr97q8fk0002rs9nw154pmah", "createdAt": "2026-07-17T15:55:27.340Z", "orderType": "PICKUP", "updatedAt": "2026-07-17T15:55:27.340Z", "discountId": null, "totalAmount": "18.25", "paymentMethod": "CREDIT_CARD", "discountAmount": "0", "idempotencyKey": null, "officialNumber": "MAIN-REG-MAIN-01-2026-000002", "voidApprovedAt": null, "voidRequestedAt": null, "voidApprovedById": null, "voidRequestedById": null, "cancellationReason": null, "clientTransactionId": null}	null	\N	\N	\N	\N
cmrp4dlci001erw9na6fpdvel	cmr97q8fk0002rs9nw154pmah	INVOICE_CREATED	Invoice	cmrp4dlb80018rw9nnbtzumrb	{"total": 18, "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "payments": [{"amount": 18, "method": "CASH", "changeAmount": 0, "currencyCode": "ILS"}]}	2026-07-17 15:55:40.242	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	{"id": "cmrp4dlb80018rw9nnbtzumrb", "items": [{"id": "cmrp4dlbj0019rw9n57nibdqj", "addons": [], "quantity": 1, "invoiceId": "cmrp4dlb80018rw9nnbtzumrb", "productId": null, "unitPrice": "5", "categoryId": null, "totalPrice": "5", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "تيراميسو", "selectedSizeSnapshot": null}, {"id": "cmrp4dlbq001arw9nq21e8ivi", "addons": [{"id": "cmrp4dlbr001brw9n3r1lrsy8", "nameSnapshot": "جبنة إضافية", "invoiceItemId": "cmrp4dlbq001arw9nq21e8ivi", "priceSnapshot": "1"}], "quantity": 1, "invoiceId": "cmrp4dlb80018rw9nnbtzumrb", "productId": null, "unitPrice": "13", "categoryId": null, "totalPrice": "13", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "مارغريتا", "selectedSizeSnapshot": "كبير"}], "number": "MAIN-REG-MAIN-01-2026-000003", "status": "PAID", "payment": {"id": "cmrp4dlby001crw9nwuk0mot0", "amount": "18", "method": "CASH", "paidAt": "2026-07-17T15:55:40.197Z", "status": "COMPLETED", "invoiceId": "cmrp4dlb80018rw9nnbtzumrb"}, "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "branchId": "cmr97q88n0000rs9nh4sethxg", "subtotal": "18", "cashierId": "cmr97q8fk0002rs9nw154pmah", "createdAt": "2026-07-17T15:55:40.197Z", "orderType": "PICKUP", "updatedAt": "2026-07-17T15:55:40.197Z", "discountId": null, "totalAmount": "18", "paymentMethod": "CASH", "discountAmount": "0", "idempotencyKey": null, "officialNumber": "MAIN-REG-MAIN-01-2026-000003", "voidApprovedAt": null, "voidRequestedAt": null, "voidApprovedById": null, "voidRequestedById": null, "cancellationReason": null, "clientTransactionId": null}	null	\N	\N	\N	\N
cmrp4s9qa001nrw9nl43f9x8n	cmr97q8fk0002rs9nw154pmah	INVOICE_CREATED	Invoice	cmrp4s9oy001grw9ny5em13mm	{"total": 29.025, "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "payments": [{"amount": 29.025, "method": "CASH", "changeAmount": 0, "currencyCode": "ILS"}]}	2026-07-17 16:07:05.026	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	{"id": "cmrp4s9oy001grw9ny5em13mm", "items": [{"id": "cmrp4s9pd001hrw9n05fs3y3m", "addons": [], "quantity": 1, "invoiceId": "cmrp4s9oy001grw9ny5em13mm", "productId": null, "unitPrice": "7.75", "categoryId": null, "totalPrice": "7.75", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "سلطة حلوم", "selectedSizeSnapshot": null}, {"id": "cmrp4s9pi001irw9noz6mmy1l", "addons": [], "quantity": 1, "invoiceId": "cmrp4s9oy001grw9ny5em13mm", "productId": null, "unitPrice": "10.5", "categoryId": null, "totalPrice": "10.5", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "بيبروني حار", "selectedSizeSnapshot": "وسط"}, {"id": "cmrp4s9pj001jrw9n8bixdwaz", "addons": [], "quantity": 1, "invoiceId": "cmrp4s9oy001grw9ny5em13mm", "productId": null, "unitPrice": "9", "categoryId": null, "totalPrice": "9", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "مارغريتا", "selectedSizeSnapshot": "وسط"}, {"id": "cmrp4s9pj001krw9n3hwi7tpu", "addons": [], "quantity": 1, "invoiceId": "cmrp4s9oy001grw9ny5em13mm", "productId": null, "unitPrice": "5", "categoryId": null, "totalPrice": "5", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "تيراميسو", "selectedSizeSnapshot": null}], "number": "MAIN-REG-MAIN-01-2026-000004", "status": "PAID", "payment": {"id": "cmrp4s9pk001lrw9nb4w6fhjy", "amount": "29.03", "method": "CASH", "paidAt": "2026-07-17T16:07:04.978Z", "status": "COMPLETED", "invoiceId": "cmrp4s9oy001grw9ny5em13mm"}, "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "branchId": "cmr97q88n0000rs9nh4sethxg", "subtotal": "32.25", "cashierId": "cmr97q8fk0002rs9nw154pmah", "createdAt": "2026-07-17T16:07:04.978Z", "orderType": "PICKUP", "updatedAt": "2026-07-17T16:07:04.978Z", "discountId": null, "totalAmount": "29.03", "paymentMethod": "CASH", "discountAmount": "3.23", "idempotencyKey": null, "officialNumber": "MAIN-REG-MAIN-01-2026-000004", "voidApprovedAt": null, "voidRequestedAt": null, "voidApprovedById": null, "voidRequestedById": null, "cancellationReason": null, "clientTransactionId": null}	null	\N	\N	\N	\N
cmrp4srr0001urw9nhv48rm59	cmr97q8fk0002rs9nw154pmah	INVOICE_UPDATED	Invoice	cmrp4s9oy001grw9ny5em13mm	{"difference": "9.45", "editedTotal": "38.48", "originalTotal": "29.03"}	2026-07-17 16:07:28.38	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	{"id": "cmrp4s9oy001grw9ny5em13mm", "items": [{"id": "cmrp4srq6001orw9n4l21c42f", "addons": [], "quantity": 1, "invoiceId": "cmrp4s9oy001grw9ny5em13mm", "productId": null, "unitPrice": "7.75", "categoryId": null, "totalPrice": "7.75", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "سلطة حلوم", "selectedSizeSnapshot": null}, {"id": "cmrp4srq8001prw9nprzvnkaz", "addons": [], "quantity": 2, "invoiceId": "cmrp4s9oy001grw9ny5em13mm", "productId": null, "unitPrice": "10.5", "categoryId": null, "totalPrice": "21", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "بيبروني حار", "selectedSizeSnapshot": "وسط"}, {"id": "cmrp4srq8001qrw9ngb9z07lm", "addons": [], "quantity": 1, "invoiceId": "cmrp4s9oy001grw9ny5em13mm", "productId": null, "unitPrice": "9", "categoryId": null, "totalPrice": "9", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "مارغريتا", "selectedSizeSnapshot": "وسط"}, {"id": "cmrp4srqa001rrw9nfb588p8c", "addons": [], "quantity": 1, "invoiceId": "cmrp4s9oy001grw9ny5em13mm", "productId": null, "unitPrice": "5", "categoryId": null, "totalPrice": "5", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "تيراميسو", "selectedSizeSnapshot": null}], "number": "MAIN-REG-MAIN-01-2026-000004", "status": "PAID", "payment": {"id": "cmrp4srqb001srw9n2qf56qlc", "amount": "38.48", "method": "CASH", "paidAt": "2026-07-17T16:07:28.348Z", "status": "COMPLETED", "invoiceId": "cmrp4s9oy001grw9ny5em13mm"}, "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "branchId": "cmr97q88n0000rs9nh4sethxg", "payments": [], "subtotal": "42.75", "cashierId": "cmr97q8fk0002rs9nw154pmah", "createdAt": "2026-07-17T16:07:04.978Z", "orderType": "PICKUP", "updatedAt": "2026-07-17T16:07:28.348Z", "discountId": null, "totalAmount": "38.48", "kitchenOrder": null, "paymentMethod": "CASH", "discountAmount": "4.28", "idempotencyKey": null, "officialNumber": "MAIN-REG-MAIN-01-2026-000004", "voidApprovedAt": null, "voidRequestedAt": null, "voidApprovedById": null, "voidRequestedById": null, "cancellationReason": null, "clientTransactionId": null}	{"id": "cmrp4s9oy001grw9ny5em13mm", "items": [{"id": "cmrp4s9pd001hrw9n05fs3y3m", "addons": [], "quantity": 1, "invoiceId": "cmrp4s9oy001grw9ny5em13mm", "productId": null, "unitPrice": "7.75", "categoryId": null, "totalPrice": "7.75", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "سلطة حلوم", "selectedSizeSnapshot": null}, {"id": "cmrp4s9pi001irw9noz6mmy1l", "addons": [], "quantity": 1, "invoiceId": "cmrp4s9oy001grw9ny5em13mm", "productId": null, "unitPrice": "10.5", "categoryId": null, "totalPrice": "10.5", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "بيبروني حار", "selectedSizeSnapshot": "وسط"}, {"id": "cmrp4s9pj001jrw9n8bixdwaz", "addons": [], "quantity": 1, "invoiceId": "cmrp4s9oy001grw9ny5em13mm", "productId": null, "unitPrice": "9", "categoryId": null, "totalPrice": "9", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "مارغريتا", "selectedSizeSnapshot": "وسط"}, {"id": "cmrp4s9pj001krw9n3hwi7tpu", "addons": [], "quantity": 1, "invoiceId": "cmrp4s9oy001grw9ny5em13mm", "productId": null, "unitPrice": "5", "categoryId": null, "totalPrice": "5", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "تيراميسو", "selectedSizeSnapshot": null}], "branch": {"id": "cmr97q88n0000rs9nh4sethxg", "code": "MAIN", "name": "Main Branch", "active": true, "nameAr": "الفرع الرئيسي", "address": "Ramallah, Palestine", "createdAt": "2026-07-06T12:45:09.815Z", "updatedAt": "2026-07-06T12:45:09.815Z"}, "number": "MAIN-REG-MAIN-01-2026-000004", "status": "PAID", "cashier": {"id": "cmr97q8fk0002rs9nw154pmah", "name": "Omar Khalil"}, "payment": {"id": "cmrp4s9pk001lrw9nb4w6fhjy", "amount": "29.03", "method": "CASH", "paidAt": "2026-07-17T16:07:04.978Z", "status": "COMPLETED", "invoiceId": "cmrp4s9oy001grw9ny5em13mm"}, "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "branchId": "cmr97q88n0000rs9nh4sethxg", "payments": [{"id": "cmrp4s9px001mrw9ntb7ghxvi", "amount": "29.03", "method": "CASH", "paidAt": "2026-07-17T16:07:05.013Z", "status": "COMPLETED", "bankFee": "0", "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "bankName": null, "cardType": null, "provider": null, "invoiceId": "cmrp4s9oy001grw9ny5em13mm", "currencyId": "cmropc0li0001do9npj34m7mp", "voidReason": null, "voidedById": null, "changeAmount": "0", "currencyCode": "ILS", "transactionAt": "2026-07-17T16:07:05.009Z", "lastFourDigits": null, "settlementDate": null, "settlementStatus": "UNSETTLED", "posTerminalNumber": null, "changeCurrencyCode": null, "exchangeRateToBase": "1", "convertedAmountBase": "29.03", "transactionReference": null}], "subtotal": "32.25", "cashierId": "cmr97q8fk0002rs9nw154pmah", "createdAt": "2026-07-17T16:07:04.978Z", "orderType": "PICKUP", "updatedAt": "2026-07-17T16:07:04.978Z", "discountId": null, "totalAmount": "29.03", "kitchenOrder": null, "paymentMethod": "CASH", "discountAmount": "3.23", "idempotencyKey": null, "officialNumber": "MAIN-REG-MAIN-01-2026-000004", "voidApprovedAt": null, "voidRequestedAt": null, "voidApprovedById": null, "voidRequestedById": null, "cancellationReason": null, "clientTransactionId": null}	\N	\N	\N	\N
cmrps98by0007zk9nn3q8e72t	cmr97q8fk0002rs9nw154pmah	INVOICE_CREATED	Invoice	cmrps98am0001zk9naibwylq7	{"total": 24.5, "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "payments": [{"amount": 24.5, "method": "CASH", "changeAmount": 0, "currencyCode": "ILS"}]}	2026-07-18 03:04:07.534	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	{"id": "cmrps98am0001zk9naibwylq7", "items": [{"id": "cmrps98b00002zk9nfbfcev3n", "addons": [], "quantity": 1, "invoiceId": "cmrps98am0001zk9naibwylq7", "productId": null, "unitPrice": "10.5", "categoryId": null, "totalPrice": "10.5", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "بيبروني حار", "selectedSizeSnapshot": "وسط"}, {"id": "cmrps98b70003zk9nlimbqvum", "addons": [], "quantity": 1, "invoiceId": "cmrps98am0001zk9naibwylq7", "productId": null, "unitPrice": "9", "categoryId": null, "totalPrice": "9", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "مارغريتا", "selectedSizeSnapshot": "وسط"}, {"id": "cmrps98b80004zk9nm8pnsi94", "addons": [], "quantity": 1, "invoiceId": "cmrps98am0001zk9naibwylq7", "productId": null, "unitPrice": "5", "categoryId": null, "totalPrice": "5", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "تيراميسو", "selectedSizeSnapshot": null}], "number": "MAIN-REG-MAIN-01-2026-000005", "status": "PAID", "payment": {"id": "cmrps98b90005zk9n7l9ybxxz", "amount": "24.5", "method": "CASH", "paidAt": "2026-07-18T03:04:07.486Z", "status": "COMPLETED", "invoiceId": "cmrps98am0001zk9naibwylq7"}, "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "branchId": "cmr97q88n0000rs9nh4sethxg", "subtotal": "24.5", "cashierId": "cmr97q8fk0002rs9nw154pmah", "createdAt": "2026-07-18T03:04:07.486Z", "orderType": "DINE_IN", "taxAmount": "0", "updatedAt": "2026-07-18T03:04:07.486Z", "discountId": null, "grandTotal": "24.5", "totalAmount": "24.5", "customerName": "mohamed", "customerNotes": "test", "customerPhone": "0598897496", "paymentMethod": "CASH", "discountAmount": "0", "idempotencyKey": "5296f6ad-c41e-4412-8901-90c3cdb6668a", "officialNumber": "MAIN-REG-MAIN-01-2026-000005", "voidApprovedAt": null, "customerAddress": null, "voidRequestedAt": null, "voidApprovedById": null, "voidRequestedById": null, "cancellationReason": null, "clientTransactionId": "d5141366-dc3f-46e7-9366-455bd80c256a"}	null	\N	\N	\N	\N
cmrpsa79i000fzk9ndqtu6hm0	cmr97q8fk0002rs9nw154pmah	INVOICE_CREATED	Invoice	cmrpsa77y0009zk9n0ml3ltpf	{"total": 16.25, "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "payments": [{"amount": 16.25, "method": "CASH", "changeAmount": 0, "currencyCode": "ILS"}]}	2026-07-18 03:04:52.806	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	{"id": "cmrpsa77y0009zk9n0ml3ltpf", "items": [{"id": "cmrpsa787000azk9nfo7nwct5", "addons": [{"id": "cmrpsa78h000bzk9ngun4d163", "nameSnapshot": "شوت إضافي", "invoiceItemId": "cmrpsa787000azk9nfo7nwct5", "priceSnapshot": "1"}], "quantity": 1, "invoiceId": "cmrpsa77y0009zk9n0ml3ltpf", "productId": null, "unitPrice": "6.25", "categoryId": null, "totalPrice": "6.25", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "فستق مثلج", "selectedSizeSnapshot": "كبير"}, {"id": "cmrpsa78t000czk9n0duz23jx", "addons": [], "quantity": 2, "invoiceId": "cmrpsa77y0009zk9n0ml3ltpf", "productId": null, "unitPrice": "5", "categoryId": null, "totalPrice": "10", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "تيراميسو", "selectedSizeSnapshot": null}], "number": "MAIN-REG-MAIN-01-2026-000006", "status": "PAID", "payment": {"id": "cmrpsa78u000dzk9n2egj7bxe", "amount": "16.25", "method": "CASH", "paidAt": "2026-07-18T03:04:52.750Z", "status": "COMPLETED", "invoiceId": "cmrpsa77y0009zk9n0ml3ltpf"}, "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "branchId": "cmr97q88n0000rs9nh4sethxg", "subtotal": "16.25", "cashierId": "cmr97q8fk0002rs9nw154pmah", "createdAt": "2026-07-18T03:04:52.750Z", "orderType": "DELIVERY", "taxAmount": "0", "updatedAt": "2026-07-18T03:04:52.750Z", "discountId": null, "grandTotal": "16.25", "totalAmount": "16.25", "customerName": "mamoun", "customerNotes": "test 2", "customerPhone": "0598897496", "paymentMethod": "CASH", "discountAmount": "0", "idempotencyKey": "73813eaf-f86b-4ed9-9205-d661d68fbd82", "officialNumber": "MAIN-REG-MAIN-01-2026-000006", "voidApprovedAt": null, "customerAddress": null, "voidRequestedAt": null, "voidApprovedById": null, "voidRequestedById": null, "cancellationReason": null, "clientTransactionId": "cd51c112-d38f-42a8-926c-a93b683245c8"}	null	\N	\N	\N	\N
cmrs7gn6z000ndg9nx5t0z1uv	cmr97q8fk0002rs9nw154pmah	INVOICE_CREATED	Invoice	cmrs7gn5m000fdg9nnlkwr5zk	{"total": 27.5, "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "payments": [{"amount": 27.5, "method": "CASH", "changeAmount": 0, "currencyCode": "ILS"}], "printJobs": 1, "cashDrawerJobs": 1}	2026-07-19 19:45:19.979	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	{"id": "cmrs7gn5m000fdg9nnlkwr5zk", "items": [{"id": "cmrs7gn5t000gdg9n5hea6cnz", "addons": [], "quantity": 1, "invoiceId": "cmrs7gn5m000fdg9nnlkwr5zk", "productId": null, "unitPrice": "7.75", "categoryId": null, "totalPrice": "7.75", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "سلطة حلوم", "selectedSizeSnapshot": null}, {"id": "cmrs7gn5w000hdg9n4knibekf", "addons": [], "quantity": 1, "invoiceId": "cmrs7gn5m000fdg9nnlkwr5zk", "productId": null, "unitPrice": "5", "categoryId": null, "totalPrice": "5", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "تيراميسو", "selectedSizeSnapshot": null}, {"id": "cmrs7gn5x000idg9n1mgu9hu8", "addons": [], "quantity": 1, "invoiceId": "cmrs7gn5m000fdg9nnlkwr5zk", "productId": null, "unitPrice": "4.25", "categoryId": null, "totalPrice": "4.25", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "فستق مثلج", "selectedSizeSnapshot": "عادي"}, {"id": "cmrs7gn5y000jdg9noah7jydw", "addons": [], "quantity": 1, "invoiceId": "cmrs7gn5m000fdg9nnlkwr5zk", "productId": null, "unitPrice": "10.5", "categoryId": null, "totalPrice": "10.5", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "بيبروني حار", "selectedSizeSnapshot": "وسط"}], "number": "MAIN-REG-MAIN-01-2026-000023", "status": "PAID", "payment": {"id": "cmrs7gn5y000kdg9n4uilyxs2", "amount": "27.5", "method": "CASH", "paidAt": "2026-07-19T19:45:19.930Z", "status": "COMPLETED", "invoiceId": "cmrs7gn5m000fdg9nnlkwr5zk"}, "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "branchId": "cmr97q88n0000rs9nh4sethxg", "payments": [{"id": "cmrs7gn6c000ldg9nrcsk09on", "amount": "27.5", "method": "CASH", "paidAt": "2026-07-19T19:45:19.956Z", "status": "COMPLETED", "bankFee": "0", "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "bankName": null, "cardType": null, "provider": null, "invoiceId": "cmrs7gn5m000fdg9nnlkwr5zk", "currencyId": "cmropc0li0001do9npj34m7mp", "voidReason": null, "voidedById": null, "changeAmount": "0", "currencyCode": "ILS", "transactionAt": "2026-07-19T19:45:19.954Z", "lastFourDigits": null, "settlementDate": null, "settlementStatus": "UNSETTLED", "posTerminalNumber": null, "changeCurrencyCode": null, "exchangeRateToBase": "1", "convertedAmountBase": "27.5", "transactionReference": null}], "subtotal": "27.5", "cashierId": "cmr97q8fk0002rs9nw154pmah", "createdAt": "2026-07-19T19:45:19.930Z", "orderType": "DELIVERY", "printJobs": [{"id": "cmrs7gn6m000mdg9n4w3gj63t", "status": "PENDING", "jobType": "CUSTOMER_RECEIPT", "branchId": "cmr97q88n0000rs9nh4sethxg", "printDeviceId": "cmrs0kvf90002t89nnfc21r9f"}], "taxAmount": "0", "updatedAt": "2026-07-19T19:45:19.930Z", "discountId": null, "grandTotal": "27.5", "totalAmount": "27.5", "customerName": "mamoun", "kitchenOrder": null, "customerNotes": "mamoun", "customerPhone": "0598897496", "paymentMethod": "CASH", "discountAmount": "0", "idempotencyKey": "0053dc75-7c9f-4d0f-a073-179d3b2aa34e", "officialNumber": "MAIN-REG-MAIN-01-2026-000023", "voidApprovedAt": null, "customerAddress": null, "voidRequestedAt": null, "voidApprovedById": null, "voidRequestedById": null, "cancellationReason": null, "clientTransactionId": "0053dc75-7c9f-4d0f-a073-179d3b2aa34e"}	null	\N	\N	\N	\N
cmrq3vjfp0006no9nksekg302	cmr97q8fk0002rs9nw154pmah	INVOICE_CREATED	Invoice	cmrq3vje10001no9nikopjh0m	{"total": 18.5, "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "payments": [{"amount": 18.5, "method": "CREDIT_CARD", "cardType": "VISA", "changeAmount": 0, "currencyCode": "ILS", "transactionReference": "POS-1784363363279"}]}	2026-07-18 08:29:24.133	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	{"id": "cmrq3vje10001no9nikopjh0m", "items": [{"id": "cmrq3vjek0002no9nv3cv0vns", "addons": [], "quantity": 1, "invoiceId": "cmrq3vje10001no9nikopjh0m", "productId": null, "unitPrice": "13.5", "categoryId": null, "totalPrice": "13.5", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "بيبروني حار", "selectedSizeSnapshot": "كبير"}, {"id": "cmrq3vjeo0003no9ndizggft3", "addons": [], "quantity": 1, "invoiceId": "cmrq3vje10001no9nikopjh0m", "productId": null, "unitPrice": "5", "categoryId": null, "totalPrice": "5", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "تيراميسو", "selectedSizeSnapshot": null}], "number": "MAIN-REG-MAIN-01-2026-000007", "status": "PAID", "payment": {"id": "cmrq3vjep0004no9noj1nywbu", "amount": "18.5", "method": "CREDIT_CARD", "paidAt": "2026-07-18T08:29:24.073Z", "status": "COMPLETED", "invoiceId": "cmrq3vje10001no9nikopjh0m"}, "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "branchId": "cmr97q88n0000rs9nh4sethxg", "subtotal": "18.5", "cashierId": "cmr97q8fk0002rs9nw154pmah", "createdAt": "2026-07-18T08:29:24.073Z", "orderType": "TAKEAWAY", "taxAmount": "0", "updatedAt": "2026-07-18T08:29:24.073Z", "discountId": null, "grandTotal": "18.5", "totalAmount": "18.5", "customerName": "test", "customerNotes": "test", "customerPhone": "059897496", "paymentMethod": "CREDIT_CARD", "discountAmount": "0", "idempotencyKey": "01b80032-a365-4f55-a6d5-f9a74bdf14e6", "officialNumber": "MAIN-REG-MAIN-01-2026-000007", "voidApprovedAt": null, "customerAddress": null, "voidRequestedAt": null, "voidApprovedById": null, "voidRequestedById": null, "cancellationReason": null, "clientTransactionId": "2594e0ad-66de-4aa4-b418-0d2d1315f5ec"}	null	\N	\N	\N	\N
cmrq4dw2n000eno9ng75ei6bi	cmr97q8fk0002rs9nw154pmah	INVOICE_CREATED	Invoice	cmrq4dw1i0008no9nhyobumga	{"total": 18.25, "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "payments": [{"amount": 18.25, "method": "CASH", "changeAmount": 0, "currencyCode": "ILS"}]}	2026-07-18 08:43:40.319	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	{"id": "cmrq4dw1i0008no9nhyobumga", "items": [{"id": "cmrq4dw1o0009no9n01q6j2ua", "addons": [], "quantity": 1, "invoiceId": "cmrq4dw1i0008no9nhyobumga", "productId": null, "unitPrice": "9", "categoryId": null, "totalPrice": "9", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "مارغريتا", "selectedSizeSnapshot": "وسط"}, {"id": "cmrq4dw1v000ano9nswem1k2a", "addons": [], "quantity": 1, "invoiceId": "cmrq4dw1i0008no9nhyobumga", "productId": null, "unitPrice": "4.25", "categoryId": null, "totalPrice": "4.25", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "فستق مثلج", "selectedSizeSnapshot": "عادي"}, {"id": "cmrq4dw1x000bno9nkehminav", "addons": [], "quantity": 1, "invoiceId": "cmrq4dw1i0008no9nhyobumga", "productId": null, "unitPrice": "5", "categoryId": null, "totalPrice": "5", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "تيراميسو", "selectedSizeSnapshot": null}], "number": "MAIN-REG-MAIN-01-2026-000008", "status": "PAID", "payment": {"id": "cmrq4dw1x000cno9nq3g1m8kf", "amount": "18.25", "method": "CASH", "paidAt": "2026-07-18T08:43:40.278Z", "status": "COMPLETED", "invoiceId": "cmrq4dw1i0008no9nhyobumga"}, "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "branchId": "cmr97q88n0000rs9nh4sethxg", "subtotal": "18.25", "cashierId": "cmr97q8fk0002rs9nw154pmah", "createdAt": "2026-07-18T08:43:40.278Z", "orderType": "TAKEAWAY", "taxAmount": "0", "updatedAt": "2026-07-18T08:43:40.278Z", "discountId": null, "grandTotal": "18.25", "totalAmount": "18.25", "customerName": "mamoun", "customerNotes": "test", "customerPhone": "0598897496", "paymentMethod": "CASH", "discountAmount": "0", "idempotencyKey": "934fb8c6-759e-47b5-8057-99f1efcb1f18", "officialNumber": "MAIN-REG-MAIN-01-2026-000008", "voidApprovedAt": null, "customerAddress": null, "voidRequestedAt": null, "voidApprovedById": null, "voidRequestedById": null, "cancellationReason": null, "clientTransactionId": "7e8d24db-49fa-4323-bf19-eb72be8f89b8"}	null	\N	\N	\N	\N
cmrqes60n0008t49nutmi3apt	cmr97q8fk0002rs9nw154pmah	INVOICE_CREATED	Invoice	cmrqes5yy0001t49n99k64h8r	{"total": 24.75, "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "payments": [{"amount": 24.75, "method": "CREDIT_CARD", "cardType": "VISA", "changeAmount": 0, "currencyCode": "ILS", "transactionReference": "POS-1784381681978"}]}	2026-07-18 13:34:42.551	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	{"id": "cmrqes5yy0001t49n99k64h8r", "items": [{"id": "cmrqes5zk0002t49nlrdip3uc", "addons": [], "quantity": 1, "invoiceId": "cmrqes5yy0001t49n99k64h8r", "productId": null, "unitPrice": "5", "categoryId": null, "totalPrice": "5", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "تيراميسو", "selectedSizeSnapshot": null}, {"id": "cmrqes5zo0003t49nna0e6xqs", "addons": [{"id": "cmrqes5zp0004t49n56cgi1e5", "nameSnapshot": "شوت إضافي", "invoiceItemId": "cmrqes5zo0003t49nna0e6xqs", "priceSnapshot": "1"}], "quantity": 1, "invoiceId": "cmrqes5yy0001t49n99k64h8r", "productId": null, "unitPrice": "6.25", "categoryId": null, "totalPrice": "6.25", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "فستق مثلج", "selectedSizeSnapshot": "كبير"}, {"id": "cmrqes5zs0005t49n1kd6rw0u", "addons": [], "quantity": 1, "invoiceId": "cmrqes5yy0001t49n99k64h8r", "productId": null, "unitPrice": "13.5", "categoryId": null, "totalPrice": "13.5", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "بيبروني حار", "selectedSizeSnapshot": "كبير"}], "number": "MAIN-REG-MAIN-01-2026-000009", "status": "PAID", "payment": {"id": "cmrqes5zu0006t49n39p23kyj", "amount": "24.75", "method": "CREDIT_CARD", "paidAt": "2026-07-18T13:34:42.490Z", "status": "COMPLETED", "invoiceId": "cmrqes5yy0001t49n99k64h8r"}, "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "branchId": "cmr97q88n0000rs9nh4sethxg", "subtotal": "24.75", "cashierId": "cmr97q8fk0002rs9nw154pmah", "createdAt": "2026-07-18T13:34:42.490Z", "orderType": "DELIVERY", "taxAmount": "0", "updatedAt": "2026-07-18T13:34:42.490Z", "discountId": null, "grandTotal": "24.75", "totalAmount": "24.75", "customerName": "test", "customerNotes": "test", "customerPhone": "0598898749", "paymentMethod": "CREDIT_CARD", "discountAmount": "0", "idempotencyKey": "4bac92d4-4bf2-4c60-9693-a4a6907accb1", "officialNumber": "MAIN-REG-MAIN-01-2026-000009", "voidApprovedAt": null, "customerAddress": null, "voidRequestedAt": null, "voidApprovedById": null, "voidRequestedById": null, "cancellationReason": null, "clientTransactionId": "83eff6b8-5924-42a4-a388-2c9b6bc7de41"}	null	\N	\N	\N	\N
cmrrkcdk90007wk9nbh0nghdh	cmr97q8fk0002rs9nw154pmah	INVOICE_CREATED	Invoice	cmrrkcdj30001wk9nd7kn6k97	{"total": 21.75, "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "payments": [{"amount": 21.75, "method": "CASH", "changeAmount": 0, "currencyCode": "ILS"}]}	2026-07-19 08:58:09.705	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	{"id": "cmrrkcdj30001wk9nd7kn6k97", "items": [{"id": "cmrrkcdjf0002wk9ncmvv1iwh", "addons": [], "quantity": 1, "invoiceId": "cmrrkcdj30001wk9nd7kn6k97", "productId": null, "unitPrice": "7.75", "categoryId": null, "totalPrice": "7.75", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "سلطة حلوم", "selectedSizeSnapshot": null}, {"id": "cmrrkcdjm0003wk9n3nbyy7qs", "addons": [], "quantity": 1, "invoiceId": "cmrrkcdj30001wk9nd7kn6k97", "productId": null, "unitPrice": "9", "categoryId": null, "totalPrice": "9", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "مارغريتا", "selectedSizeSnapshot": "وسط"}, {"id": "cmrrkcdjn0004wk9noqib9rzp", "addons": [], "quantity": 1, "invoiceId": "cmrrkcdj30001wk9nd7kn6k97", "productId": null, "unitPrice": "5", "categoryId": null, "totalPrice": "5", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "تيراميسو", "selectedSizeSnapshot": null}], "number": "MAIN-REG-MAIN-01-2026-000010", "status": "PAID", "payment": {"id": "cmrrkcdjo0005wk9nrofbos65", "amount": "21.75", "method": "CASH", "paidAt": "2026-07-19T08:58:09.663Z", "status": "COMPLETED", "invoiceId": "cmrrkcdj30001wk9nd7kn6k97"}, "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "branchId": "cmr97q88n0000rs9nh4sethxg", "subtotal": "21.75", "cashierId": "cmr97q8fk0002rs9nw154pmah", "createdAt": "2026-07-19T08:58:09.663Z", "orderType": "TAKEAWAY", "taxAmount": "0", "updatedAt": "2026-07-19T08:58:09.663Z", "discountId": null, "grandTotal": "21.75", "totalAmount": "21.75", "customerName": "1", "customerNotes": null, "customerPhone": "0598897496", "paymentMethod": "CASH", "discountAmount": "0", "idempotencyKey": "11828e00-8ebf-4d71-aa4d-de2bacc9a0cb", "officialNumber": "MAIN-REG-MAIN-01-2026-000010", "voidApprovedAt": null, "customerAddress": null, "voidRequestedAt": null, "voidApprovedById": null, "voidRequestedById": null, "cancellationReason": null, "clientTransactionId": "11828e00-8ebf-4d71-aa4d-de2bacc9a0cb"}	null	\N	\N	\N	\N
cmrrkh7eo000dwk9na5jnm9qy	cmr97q8fk0002rs9nw154pmah	INVOICE_CREATED	Invoice	cmrrkh7dr0009wk9nsilpb5j5	{"total": 5, "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "payments": [{"amount": 5, "method": "CASH", "changeAmount": 0, "currencyCode": "ILS"}]}	2026-07-19 09:01:55.008	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	{"id": "cmrrkh7dr0009wk9nsilpb5j5", "items": [{"id": "cmrrkh7dz000awk9noj021y38", "addons": [], "quantity": 1, "invoiceId": "cmrrkh7dr0009wk9nsilpb5j5", "productId": null, "unitPrice": "5", "categoryId": null, "totalPrice": "5", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "تيراميسو", "selectedSizeSnapshot": null}], "number": "MAIN-REG-MAIN-01-2026-000011", "status": "PAID", "payment": {"id": "cmrrkh7e9000bwk9nanlw1tyu", "amount": "5", "method": "CASH", "paidAt": "2026-07-19T09:01:54.975Z", "status": "COMPLETED", "invoiceId": "cmrrkh7dr0009wk9nsilpb5j5"}, "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "branchId": "cmr97q88n0000rs9nh4sethxg", "subtotal": "5", "cashierId": "cmr97q8fk0002rs9nw154pmah", "createdAt": "2026-07-19T09:01:54.975Z", "orderType": "TAKEAWAY", "taxAmount": "0", "updatedAt": "2026-07-19T09:01:54.975Z", "discountId": null, "grandTotal": "5", "totalAmount": "5", "customerName": null, "customerNotes": null, "customerPhone": null, "paymentMethod": "CASH", "discountAmount": "0", "idempotencyKey": "d6588fe3-83a5-4267-aeb4-5cbcb588b9ac", "officialNumber": "MAIN-REG-MAIN-01-2026-000011", "voidApprovedAt": null, "customerAddress": null, "voidRequestedAt": null, "voidApprovedById": null, "voidRequestedById": null, "cancellationReason": null, "clientTransactionId": "d6588fe3-83a5-4267-aeb4-5cbcb588b9ac"}	null	\N	\N	\N	\N
cmrrkw20q0005i09nsw3o4py7	cmr97q8fk0002rs9nw154pmah	INVOICE_CREATED	Invoice	cmrrkw1zw0001i09nt305ldb5	{"total": 4.25, "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "payments": [{"amount": 4.25, "method": "CASH", "changeAmount": 0, "currencyCode": "ILS"}]}	2026-07-19 09:13:27.866	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	{"id": "cmrrkw1zw0001i09nt305ldb5", "items": [{"id": "cmrrkw2050002i09nqt8mn065", "addons": [], "quantity": 1, "invoiceId": "cmrrkw1zw0001i09nt305ldb5", "productId": null, "unitPrice": "4.25", "categoryId": null, "totalPrice": "4.25", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "فستق مثلج", "selectedSizeSnapshot": "عادي"}], "number": "MAIN-REG-MAIN-01-2026-000012", "status": "PAID", "payment": {"id": "cmrrkw2060003i09nv759q8qj", "amount": "4.25", "method": "CASH", "paidAt": "2026-07-19T09:13:27.836Z", "status": "COMPLETED", "invoiceId": "cmrrkw1zw0001i09nt305ldb5"}, "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "branchId": "cmr97q88n0000rs9nh4sethxg", "subtotal": "4.25", "cashierId": "cmr97q8fk0002rs9nw154pmah", "createdAt": "2026-07-19T09:13:27.836Z", "orderType": "TAKEAWAY", "taxAmount": "0", "updatedAt": "2026-07-19T09:13:27.836Z", "discountId": null, "grandTotal": "4.25", "totalAmount": "4.25", "customerName": null, "customerNotes": null, "customerPhone": null, "paymentMethod": "CASH", "discountAmount": "0", "idempotencyKey": "fb6dfad5-7dde-4468-904f-073bce96d1a3", "officialNumber": "MAIN-REG-MAIN-01-2026-000012", "voidApprovedAt": null, "customerAddress": null, "voidRequestedAt": null, "voidApprovedById": null, "voidRequestedById": null, "cancellationReason": null, "clientTransactionId": "fb6dfad5-7dde-4468-904f-073bce96d1a3"}	null	\N	\N	\N	\N
cmrrl3pao000di09neiehmkpk	cmr97q8fk0002rs9nw154pmah	INVOICE_CREATED	Invoice	cmrrl3p9a0007i09nbrkjjsvp	{"total": 11.25, "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "payments": [{"amount": 11.25, "method": "CASH", "changeAmount": 0, "currencyCode": "ILS"}]}	2026-07-19 09:19:24.624	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	{"id": "cmrrl3p9a0007i09nbrkjjsvp", "items": [{"id": "cmrrl3p9l0008i09n8zqevtbl", "addons": [], "quantity": 1, "invoiceId": "cmrrl3p9a0007i09nbrkjjsvp", "productId": null, "unitPrice": "5", "categoryId": null, "totalPrice": "5", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "تيراميسو", "selectedSizeSnapshot": null}, {"id": "cmrrl3p9u0009i09nafqbiwdv", "addons": [{"id": "cmrrl3p9v000ai09n65ipk6df", "nameSnapshot": "شوت إضافي", "invoiceItemId": "cmrrl3p9u0009i09nafqbiwdv", "priceSnapshot": "1"}], "quantity": 1, "invoiceId": "cmrrl3p9a0007i09nbrkjjsvp", "productId": null, "unitPrice": "6.25", "categoryId": null, "totalPrice": "6.25", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "فستق مثلج", "selectedSizeSnapshot": "كبير"}], "number": "MAIN-REG-MAIN-01-2026-000013", "status": "PAID", "payment": {"id": "cmrrl3p9y000bi09nn63bc43t", "amount": "11.25", "method": "CASH", "paidAt": "2026-07-19T09:19:24.575Z", "status": "COMPLETED", "invoiceId": "cmrrl3p9a0007i09nbrkjjsvp"}, "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "branchId": "cmr97q88n0000rs9nh4sethxg", "subtotal": "11.25", "cashierId": "cmr97q8fk0002rs9nw154pmah", "createdAt": "2026-07-19T09:19:24.575Z", "orderType": "TAKEAWAY", "taxAmount": "0", "updatedAt": "2026-07-19T09:19:24.575Z", "discountId": null, "grandTotal": "11.25", "totalAmount": "11.25", "customerName": null, "customerNotes": null, "customerPhone": null, "paymentMethod": "CASH", "discountAmount": "0", "idempotencyKey": "4d92ec44-62fb-400c-b51f-894ef372d937", "officialNumber": "MAIN-REG-MAIN-01-2026-000013", "voidApprovedAt": null, "customerAddress": null, "voidRequestedAt": null, "voidApprovedById": null, "voidRequestedById": null, "cancellationReason": null, "clientTransactionId": "4d92ec44-62fb-400c-b51f-894ef372d937"}	null	\N	\N	\N	\N
cmrs0kbdp0001t89nyebsksd4	cmr97q8fb0001rs9nulxof0w3	PRINT_PAIRING_CODE_CREATED	PrintPairingCode	cmrs0kbcr0000t89n3wyv61pr	{"branchId": "cmr97q88n0000rs9nh4sethxg", "expiresAt": "2026-07-19T16:42:13.903Z"}	2026-07-19 16:32:13.981	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	null	null	\N	\N	\N	\N
cmrs3i87u0007jw9nmpbi2phr	cmr97q8fk0002rs9nw154pmah	INVOICE_CREATED	Invoice	cmrs3i8620001jw9ncmj50u1w	{"total": 19.25, "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "payments": [{"amount": 19.25, "method": "CASH", "changeAmount": 0, "currencyCode": "ILS"}], "printJobs": 0, "cashDrawerJobs": 0}	2026-07-19 17:54:35.418	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	{"id": "cmrs3i8620001jw9ncmj50u1w", "items": [{"id": "cmrs3i86c0002jw9nw1eqe0i0", "addons": [], "quantity": 1, "invoiceId": "cmrs3i8620001jw9ncmj50u1w", "productId": null, "unitPrice": "4.25", "categoryId": null, "totalPrice": "4.25", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "فستق مثلج", "selectedSizeSnapshot": "عادي"}, {"id": "cmrs3i86i0003jw9nyxckdyfk", "addons": [], "quantity": 1, "invoiceId": "cmrs3i8620001jw9ncmj50u1w", "productId": null, "unitPrice": "4.5", "categoryId": null, "totalPrice": "4.5", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "بطاطا محملة", "selectedSizeSnapshot": "صغير"}, {"id": "cmrs3i86j0004jw9ngouyiu08", "addons": [], "quantity": 1, "invoiceId": "cmrs3i8620001jw9ncmj50u1w", "productId": null, "unitPrice": "10.5", "categoryId": null, "totalPrice": "10.5", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "بيبروني حار", "selectedSizeSnapshot": "وسط"}], "number": "MAIN-REG-MAIN-01-2026-000014", "status": "PAID", "payment": {"id": "cmrs3i86k0005jw9n3aba8sqr", "amount": "19.25", "method": "CASH", "paidAt": "2026-07-19T17:54:35.354Z", "status": "COMPLETED", "invoiceId": "cmrs3i8620001jw9ncmj50u1w"}, "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "branchId": "cmr97q88n0000rs9nh4sethxg", "payments": [{"id": "cmrs3i8750006jw9nc8n9dz1c", "amount": "19.25", "method": "CASH", "paidAt": "2026-07-19T17:54:35.393Z", "status": "COMPLETED", "bankFee": "0", "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "bankName": null, "cardType": null, "provider": null, "invoiceId": "cmrs3i8620001jw9ncmj50u1w", "currencyId": "cmropc0li0001do9npj34m7mp", "voidReason": null, "voidedById": null, "changeAmount": "0", "currencyCode": "ILS", "transactionAt": "2026-07-19T17:54:35.391Z", "lastFourDigits": null, "settlementDate": null, "settlementStatus": "UNSETTLED", "posTerminalNumber": null, "changeCurrencyCode": null, "exchangeRateToBase": "1", "convertedAmountBase": "19.25", "transactionReference": null}], "subtotal": "19.25", "cashierId": "cmr97q8fk0002rs9nw154pmah", "createdAt": "2026-07-19T17:54:35.354Z", "orderType": "TAKEAWAY", "printJobs": [], "taxAmount": "0", "updatedAt": "2026-07-19T17:54:35.354Z", "discountId": null, "grandTotal": "19.25", "totalAmount": "19.25", "customerName": null, "kitchenOrder": null, "customerNotes": null, "customerPhone": null, "paymentMethod": "CASH", "discountAmount": "0", "idempotencyKey": "6f42b2ed-f0ac-4354-8681-1b782f24b9d4", "officialNumber": "MAIN-REG-MAIN-01-2026-000014", "voidApprovedAt": null, "customerAddress": null, "voidRequestedAt": null, "voidApprovedById": null, "voidRequestedById": null, "cancellationReason": null, "clientTransactionId": "6f42b2ed-f0ac-4354-8681-1b782f24b9d4"}	null	\N	\N	\N	\N
cmrs3k8j3000ejw9n6gbqog3p	cmr97q8fk0002rs9nw154pmah	INVOICE_CREATED	Invoice	cmrs3k8hh0009jw9nrotoxd1e	{"total": 8.75, "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "payments": [{"amount": 8.75, "method": "CASH", "changeAmount": 0, "currencyCode": "ILS"}], "printJobs": 0, "cashDrawerJobs": 0}	2026-07-19 17:56:09.137	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	{"id": "cmrs3k8hh0009jw9nrotoxd1e", "items": [{"id": "cmrs3k8hm000ajw9nvh28p0lk", "addons": [], "quantity": 1, "invoiceId": "cmrs3k8hh0009jw9nrotoxd1e", "productId": null, "unitPrice": "4.25", "categoryId": null, "totalPrice": "4.25", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "فستق مثلج", "selectedSizeSnapshot": "عادي"}, {"id": "cmrs3k8hr000bjw9ncknabxxy", "addons": [], "quantity": 1, "invoiceId": "cmrs3k8hh0009jw9nrotoxd1e", "productId": null, "unitPrice": "4.5", "categoryId": null, "totalPrice": "4.5", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "بطاطا محملة", "selectedSizeSnapshot": "صغير"}], "number": "MAIN-REG-MAIN-01-2026-000015", "status": "PAID", "payment": {"id": "cmrs3k8ht000cjw9neqf939d6", "amount": "8.75", "method": "CASH", "paidAt": "2026-07-19T17:56:09.077Z", "status": "COMPLETED", "invoiceId": "cmrs3k8hh0009jw9nrotoxd1e"}, "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "branchId": "cmr97q88n0000rs9nh4sethxg", "payments": [{"id": "cmrs3k8id000djw9nhuspx5um", "amount": "8.75", "method": "CASH", "paidAt": "2026-07-19T17:56:09.109Z", "status": "COMPLETED", "bankFee": "0", "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "bankName": null, "cardType": null, "provider": null, "invoiceId": "cmrs3k8hh0009jw9nrotoxd1e", "currencyId": "cmropc0li0001do9npj34m7mp", "voidReason": null, "voidedById": null, "changeAmount": "0", "currencyCode": "ILS", "transactionAt": "2026-07-19T17:56:09.107Z", "lastFourDigits": null, "settlementDate": null, "settlementStatus": "UNSETTLED", "posTerminalNumber": null, "changeCurrencyCode": null, "exchangeRateToBase": "1", "convertedAmountBase": "8.75", "transactionReference": null}], "subtotal": "8.75", "cashierId": "cmr97q8fk0002rs9nw154pmah", "createdAt": "2026-07-19T17:56:09.077Z", "orderType": "TAKEAWAY", "printJobs": [], "taxAmount": "0", "updatedAt": "2026-07-19T17:56:09.077Z", "discountId": null, "grandTotal": "8.75", "totalAmount": "8.75", "customerName": null, "kitchenOrder": null, "customerNotes": null, "customerPhone": null, "paymentMethod": "CASH", "discountAmount": "0", "idempotencyKey": "6602dc62-a8f2-443c-b770-ca5edf30f551", "officialNumber": "MAIN-REG-MAIN-01-2026-000015", "voidApprovedAt": null, "customerAddress": null, "voidRequestedAt": null, "voidApprovedById": null, "voidRequestedById": null, "cancellationReason": null, "clientTransactionId": "6602dc62-a8f2-443c-b770-ca5edf30f551"}	null	\N	\N	\N	\N
cmrs3t7at000ljw9no0euf93d	cmr97q8fk0002rs9nw154pmah	INVOICE_CREATED	Invoice	cmrs3t771000gjw9n8zo1g6p5	{"total": 12.25, "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "payments": [{"amount": 12.25, "method": "CASH", "changeAmount": 0, "currencyCode": "ILS"}], "printJobs": 0, "cashDrawerJobs": 0}	2026-07-19 18:03:07.445	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	{"id": "cmrs3t771000gjw9n8zo1g6p5", "items": [{"id": "cmrs3t794000hjw9nj9vpcav3", "addons": [], "quantity": 1, "invoiceId": "cmrs3t771000gjw9n8zo1g6p5", "productId": null, "unitPrice": "7.75", "categoryId": null, "totalPrice": "7.75", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "سلطة حلوم", "selectedSizeSnapshot": null}, {"id": "cmrs3t79c000ijw9ndycw89ej", "addons": [], "quantity": 1, "invoiceId": "cmrs3t771000gjw9n8zo1g6p5", "productId": null, "unitPrice": "4.5", "categoryId": null, "totalPrice": "4.5", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "بطاطا محملة", "selectedSizeSnapshot": "صغير"}], "number": "MAIN-REG-MAIN-01-2026-000016", "status": "PAID", "payment": {"id": "cmrs3t79e000jjw9n2uenlx6a", "amount": "12.25", "method": "CASH", "paidAt": "2026-07-19T18:03:07.309Z", "status": "COMPLETED", "invoiceId": "cmrs3t771000gjw9n8zo1g6p5"}, "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "branchId": "cmr97q88n0000rs9nh4sethxg", "payments": [{"id": "cmrs3t79x000kjw9noct4fe8r", "amount": "12.25", "method": "CASH", "paidAt": "2026-07-19T18:03:07.413Z", "status": "COMPLETED", "bankFee": "0", "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "bankName": null, "cardType": null, "provider": null, "invoiceId": "cmrs3t771000gjw9n8zo1g6p5", "currencyId": "cmropc0li0001do9npj34m7mp", "voidReason": null, "voidedById": null, "changeAmount": "0", "currencyCode": "ILS", "transactionAt": "2026-07-19T18:03:07.410Z", "lastFourDigits": null, "settlementDate": null, "settlementStatus": "UNSETTLED", "posTerminalNumber": null, "changeCurrencyCode": null, "exchangeRateToBase": "1", "convertedAmountBase": "12.25", "transactionReference": null}], "subtotal": "12.25", "cashierId": "cmr97q8fk0002rs9nw154pmah", "createdAt": "2026-07-19T18:03:07.309Z", "orderType": "TAKEAWAY", "printJobs": [], "taxAmount": "0", "updatedAt": "2026-07-19T18:03:07.309Z", "discountId": null, "grandTotal": "12.25", "totalAmount": "12.25", "customerName": null, "kitchenOrder": null, "customerNotes": null, "customerPhone": null, "paymentMethod": "CASH", "discountAmount": "0", "idempotencyKey": "7a14ed93-826f-4a30-ac32-fbeed0dce355", "officialNumber": "MAIN-REG-MAIN-01-2026-000016", "voidApprovedAt": null, "customerAddress": null, "voidRequestedAt": null, "voidApprovedById": null, "voidRequestedById": null, "cancellationReason": null, "clientTransactionId": "7a14ed93-826f-4a30-ac32-fbeed0dce355"}	null	\N	\N	\N	\N
cmrs3v120000ujw9n2l81rtpa	cmr97q8fk0002rs9nw154pmah	INVOICE_CREATED	Invoice	cmrs3v10k000njw9noylub518	{"total": 20.25, "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "payments": [{"amount": 20.25, "method": "CASH", "changeAmount": 0, "currencyCode": "ILS"}], "printJobs": 0, "cashDrawerJobs": 0}	2026-07-19 18:04:32.664	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	{"id": "cmrs3v10k000njw9noylub518", "items": [{"id": "cmrs3v10r000ojw9na0mtj54a", "addons": [{"id": "cmrs3v10x000pjw9ne5yweqay", "nameSnapshot": "شوت إضافي", "invoiceItemId": "cmrs3v10r000ojw9na0mtj54a", "priceSnapshot": "1"}], "quantity": 1, "invoiceId": "cmrs3v10k000njw9noylub518", "productId": null, "unitPrice": "5.25", "categoryId": null, "totalPrice": "5.25", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "فستق مثلج", "selectedSizeSnapshot": "عادي"}, {"id": "cmrs3v110000qjw9nqxqroyxt", "addons": [], "quantity": 1, "invoiceId": "cmrs3v10k000njw9noylub518", "productId": null, "unitPrice": "4.5", "categoryId": null, "totalPrice": "4.5", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "بطاطا محملة", "selectedSizeSnapshot": "صغير"}, {"id": "cmrs3v111000rjw9n79ogem6s", "addons": [], "quantity": 1, "invoiceId": "cmrs3v10k000njw9noylub518", "productId": null, "unitPrice": "10.5", "categoryId": null, "totalPrice": "10.5", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "بيبروني حار", "selectedSizeSnapshot": "وسط"}], "number": "MAIN-REG-MAIN-01-2026-000017", "status": "PAID", "payment": {"id": "cmrs3v111000sjw9nx0206bci", "amount": "20.25", "method": "CASH", "paidAt": "2026-07-19T18:04:32.612Z", "status": "COMPLETED", "invoiceId": "cmrs3v10k000njw9noylub518"}, "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "branchId": "cmr97q88n0000rs9nh4sethxg", "payments": [{"id": "cmrs3v11i000tjw9npbjfgjeb", "amount": "20.25", "method": "CASH", "paidAt": "2026-07-19T18:04:32.646Z", "status": "COMPLETED", "bankFee": "0", "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "bankName": null, "cardType": null, "provider": null, "invoiceId": "cmrs3v10k000njw9noylub518", "currencyId": "cmropc0li0001do9npj34m7mp", "voidReason": null, "voidedById": null, "changeAmount": "0", "currencyCode": "ILS", "transactionAt": "2026-07-19T18:04:32.644Z", "lastFourDigits": null, "settlementDate": null, "settlementStatus": "UNSETTLED", "posTerminalNumber": null, "changeCurrencyCode": null, "exchangeRateToBase": "1", "convertedAmountBase": "20.25", "transactionReference": null}], "subtotal": "20.25", "cashierId": "cmr97q8fk0002rs9nw154pmah", "createdAt": "2026-07-19T18:04:32.612Z", "orderType": "TAKEAWAY", "printJobs": [], "taxAmount": "0", "updatedAt": "2026-07-19T18:04:32.612Z", "discountId": null, "grandTotal": "20.25", "totalAmount": "20.25", "customerName": null, "kitchenOrder": null, "customerNotes": null, "customerPhone": null, "paymentMethod": "CASH", "discountAmount": "0", "idempotencyKey": "a1e01b7f-b274-4493-aa70-b1f8d5de0b61", "officialNumber": "MAIN-REG-MAIN-01-2026-000017", "voidApprovedAt": null, "customerAddress": null, "voidRequestedAt": null, "voidApprovedById": null, "voidRequestedById": null, "cancellationReason": null, "clientTransactionId": "a1e01b7f-b274-4493-aa70-b1f8d5de0b61"}	null	\N	\N	\N	\N
cmrs4azqx0006cg9nm6kfq3sc	cmr97q8fk0002rs9nw154pmah	INVOICE_CREATED	Invoice	cmrs4azpn0001cg9na8o6awqq	{"total": 16.75, "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "payments": [{"amount": 16.75, "method": "CASH", "changeAmount": 0, "currencyCode": "ILS"}], "printJobs": 0, "cashDrawerJobs": 0}	2026-07-19 18:16:57.465	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	{"id": "cmrs4azpn0001cg9na8o6awqq", "items": [{"id": "cmrs4azpx0002cg9neu5w7zni", "addons": [], "quantity": 1, "invoiceId": "cmrs4azpn0001cg9na8o6awqq", "productId": null, "unitPrice": "9", "categoryId": null, "totalPrice": "9", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "مارغريتا", "selectedSizeSnapshot": "وسط"}, {"id": "cmrs4azpy0003cg9n4dd3vqn1", "addons": [], "quantity": 1, "invoiceId": "cmrs4azpn0001cg9na8o6awqq", "productId": null, "unitPrice": "7.75", "categoryId": null, "totalPrice": "7.75", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "سلطة حلوم", "selectedSizeSnapshot": null}], "number": "MAIN-REG-MAIN-01-2026-000018", "status": "PAID", "payment": {"id": "cmrs4azpz0004cg9nmob6t0m7", "amount": "16.75", "method": "CASH", "paidAt": "2026-07-19T18:16:57.420Z", "status": "COMPLETED", "invoiceId": "cmrs4azpn0001cg9na8o6awqq"}, "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "branchId": "cmr97q88n0000rs9nh4sethxg", "payments": [{"id": "cmrs4azqf0005cg9nzx71r4u4", "amount": "16.75", "method": "CASH", "paidAt": "2026-07-19T18:16:57.447Z", "status": "COMPLETED", "bankFee": "0", "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "bankName": null, "cardType": null, "provider": null, "invoiceId": "cmrs4azpn0001cg9na8o6awqq", "currencyId": "cmropc0li0001do9npj34m7mp", "voidReason": null, "voidedById": null, "changeAmount": "0", "currencyCode": "ILS", "transactionAt": "2026-07-19T18:16:57.445Z", "lastFourDigits": null, "settlementDate": null, "settlementStatus": "UNSETTLED", "posTerminalNumber": null, "changeCurrencyCode": null, "exchangeRateToBase": "1", "convertedAmountBase": "16.75", "transactionReference": null}], "subtotal": "16.75", "cashierId": "cmr97q8fk0002rs9nw154pmah", "createdAt": "2026-07-19T18:16:57.420Z", "orderType": "TAKEAWAY", "printJobs": [], "taxAmount": "0", "updatedAt": "2026-07-19T18:16:57.420Z", "discountId": null, "grandTotal": "16.75", "totalAmount": "16.75", "customerName": null, "kitchenOrder": null, "customerNotes": null, "customerPhone": null, "paymentMethod": "CASH", "discountAmount": "0", "idempotencyKey": "9585ee57-25d3-48ec-b4b3-2605722fa5f2", "officialNumber": "MAIN-REG-MAIN-01-2026-000018", "voidApprovedAt": null, "customerAddress": null, "voidRequestedAt": null, "voidApprovedById": null, "voidRequestedById": null, "cancellationReason": null, "clientTransactionId": "9585ee57-25d3-48ec-b4b3-2605722fa5f2"}	null	\N	\N	\N	\N
cmrs4j1cq0007gk9n54wpracb	cmr97q8fk0002rs9nw154pmah	INVOICE_CREATED	Invoice	cmrs4j1at0001gk9ndsggw6an	{"total": 9.5, "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "payments": [{"amount": 9.5, "method": "CASH", "changeAmount": 0, "currencyCode": "ILS"}], "printJobs": 1, "cashDrawerJobs": 1}	2026-07-19 18:23:12.794	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	{"id": "cmrs4j1at0001gk9ndsggw6an", "items": [{"id": "cmrs4j1b10002gk9n7ms45uuw", "addons": [], "quantity": 1, "invoiceId": "cmrs4j1at0001gk9ndsggw6an", "productId": null, "unitPrice": "5", "categoryId": null, "totalPrice": "5", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "تيراميسو", "selectedSizeSnapshot": null}, {"id": "cmrs4j1b40003gk9nfvz7j6sv", "addons": [], "quantity": 1, "invoiceId": "cmrs4j1at0001gk9ndsggw6an", "productId": null, "unitPrice": "4.5", "categoryId": null, "totalPrice": "4.5", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "بطاطا محملة", "selectedSizeSnapshot": "صغير"}], "number": "MAIN-REG-MAIN-01-2026-000019", "status": "PAID", "payment": {"id": "cmrs4j1b50004gk9nvbqgzm8n", "amount": "9.5", "method": "CASH", "paidAt": "2026-07-19T18:23:12.725Z", "status": "COMPLETED", "invoiceId": "cmrs4j1at0001gk9ndsggw6an"}, "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "branchId": "cmr97q88n0000rs9nh4sethxg", "payments": [{"id": "cmrs4j1bj0005gk9ng0axyyzb", "amount": "9.5", "method": "CASH", "paidAt": "2026-07-19T18:23:12.751Z", "status": "COMPLETED", "bankFee": "0", "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "bankName": null, "cardType": null, "provider": null, "invoiceId": "cmrs4j1at0001gk9ndsggw6an", "currencyId": "cmropc0li0001do9npj34m7mp", "voidReason": null, "voidedById": null, "changeAmount": "0", "currencyCode": "ILS", "transactionAt": "2026-07-19T18:23:12.750Z", "lastFourDigits": null, "settlementDate": null, "settlementStatus": "UNSETTLED", "posTerminalNumber": null, "changeCurrencyCode": null, "exchangeRateToBase": "1", "convertedAmountBase": "9.5", "transactionReference": null}], "subtotal": "9.5", "cashierId": "cmr97q8fk0002rs9nw154pmah", "createdAt": "2026-07-19T18:23:12.725Z", "orderType": "TAKEAWAY", "printJobs": [{"id": "cmrs4j1ca0006gk9nzcsoxf1k", "status": "PENDING", "jobType": "CUSTOMER_RECEIPT"}], "taxAmount": "0", "updatedAt": "2026-07-19T18:23:12.725Z", "discountId": null, "grandTotal": "9.5", "totalAmount": "9.5", "customerName": null, "kitchenOrder": null, "customerNotes": null, "customerPhone": null, "paymentMethod": "CASH", "discountAmount": "0", "idempotencyKey": "3e0f71e6-378f-45ba-a9e5-afb3757ca28f", "officialNumber": "MAIN-REG-MAIN-01-2026-000019", "voidApprovedAt": null, "customerAddress": null, "voidRequestedAt": null, "voidApprovedById": null, "voidRequestedById": null, "cancellationReason": null, "clientTransactionId": "3e0f71e6-378f-45ba-a9e5-afb3757ca28f"}	null	\N	\N	\N	\N
cmrs5f6u20007uw9n2gca2vul	cmr97q8fk0002rs9nw154pmah	INVOICE_CREATED	Invoice	cmrs5f6rn0001uw9n5yczkqh6	{"total": 9.25, "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "payments": [{"amount": 9.25, "method": "CASH", "changeAmount": 0, "currencyCode": "ILS"}], "printJobs": 1, "cashDrawerJobs": 1}	2026-07-19 18:48:12.89	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	{"id": "cmrs5f6rn0001uw9n5yczkqh6", "items": [{"id": "cmrs5f6rv0002uw9ngaxy85jm", "addons": [], "quantity": 1, "invoiceId": "cmrs5f6rn0001uw9n5yczkqh6", "productId": null, "unitPrice": "5", "categoryId": null, "totalPrice": "5", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "تيراميسو", "selectedSizeSnapshot": null}, {"id": "cmrs5f6s00003uw9n6zx9i71b", "addons": [], "quantity": 1, "invoiceId": "cmrs5f6rn0001uw9n5yczkqh6", "productId": null, "unitPrice": "4.25", "categoryId": null, "totalPrice": "4.25", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "فستق مثلج", "selectedSizeSnapshot": "عادي"}], "number": "MAIN-REG-MAIN-01-2026-000020", "status": "PAID", "payment": {"id": "cmrs5f6s10004uw9n5dwxr2sj", "amount": "9.25", "method": "CASH", "paidAt": "2026-07-19T18:48:12.803Z", "status": "COMPLETED", "invoiceId": "cmrs5f6rn0001uw9n5yczkqh6"}, "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "branchId": "cmr97q88n0000rs9nh4sethxg", "payments": [{"id": "cmrs5f6sj0005uw9nedjmm4ao", "amount": "9.25", "method": "CASH", "paidAt": "2026-07-19T18:48:12.835Z", "status": "COMPLETED", "bankFee": "0", "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "bankName": null, "cardType": null, "provider": null, "invoiceId": "cmrs5f6rn0001uw9n5yczkqh6", "currencyId": "cmropc0li0001do9npj34m7mp", "voidReason": null, "voidedById": null, "changeAmount": "0", "currencyCode": "ILS", "transactionAt": "2026-07-19T18:48:12.832Z", "lastFourDigits": null, "settlementDate": null, "settlementStatus": "UNSETTLED", "posTerminalNumber": null, "changeCurrencyCode": null, "exchangeRateToBase": "1", "convertedAmountBase": "9.25", "transactionReference": null}], "subtotal": "9.25", "cashierId": "cmr97q8fk0002rs9nw154pmah", "createdAt": "2026-07-19T18:48:12.803Z", "orderType": "TAKEAWAY", "printJobs": [{"id": "cmrs5f6tf0006uw9n0he9puto", "status": "PENDING", "jobType": "CUSTOMER_RECEIPT", "branchId": "cmr97q88n0000rs9nh4sethxg", "printDeviceId": "cmrs0kvf90002t89nnfc21r9f"}], "taxAmount": "0", "updatedAt": "2026-07-19T18:48:12.803Z", "discountId": null, "grandTotal": "9.25", "totalAmount": "9.25", "customerName": null, "kitchenOrder": null, "customerNotes": null, "customerPhone": null, "paymentMethod": "CASH", "discountAmount": "0", "idempotencyKey": "e4178fa7-853a-41ce-b7a8-83ba272e0e96", "officialNumber": "MAIN-REG-MAIN-01-2026-000020", "voidApprovedAt": null, "customerAddress": null, "voidRequestedAt": null, "voidApprovedById": null, "voidRequestedById": null, "cancellationReason": null, "clientTransactionId": "e4178fa7-853a-41ce-b7a8-83ba272e0e96"}	null	\N	\N	\N	\N
cmrs5kjva000kuw9n6lfdic3c	cmr97q8fk0002rs9nw154pmah	INVOICE_CREATED	Invoice	cmrs5kjt2000euw9nyoi3rcln	{"total": 9.25, "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "payments": [{"amount": 9.25, "method": "CASH", "changeAmount": 0, "currencyCode": "ILS"}], "printJobs": 1, "cashDrawerJobs": 1}	2026-07-19 18:52:23.062	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	{"id": "cmrs5kjt2000euw9nyoi3rcln", "items": [{"id": "cmrs5kjtb000fuw9nxvz3fsxg", "addons": [], "quantity": 1, "invoiceId": "cmrs5kjt2000euw9nyoi3rcln", "productId": null, "unitPrice": "4.25", "categoryId": null, "totalPrice": "4.25", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "فستق مثلج", "selectedSizeSnapshot": "عادي"}, {"id": "cmrs5kjtk000guw9nwdx8eeum", "addons": [], "quantity": 1, "invoiceId": "cmrs5kjt2000euw9nyoi3rcln", "productId": null, "unitPrice": "5", "categoryId": null, "totalPrice": "5", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "تيراميسو", "selectedSizeSnapshot": null}], "number": "MAIN-REG-MAIN-01-2026-000021", "status": "PAID", "payment": {"id": "cmrs5kjtq000huw9n4wyu4c95", "amount": "9.25", "method": "CASH", "paidAt": "2026-07-19T18:52:22.982Z", "status": "COMPLETED", "invoiceId": "cmrs5kjt2000euw9nyoi3rcln"}, "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "branchId": "cmr97q88n0000rs9nh4sethxg", "payments": [{"id": "cmrs5kjub000iuw9npnfqs33i", "amount": "9.25", "method": "CASH", "paidAt": "2026-07-19T18:52:23.027Z", "status": "COMPLETED", "bankFee": "0", "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "bankName": null, "cardType": null, "provider": null, "invoiceId": "cmrs5kjt2000euw9nyoi3rcln", "currencyId": "cmropc0li0001do9npj34m7mp", "voidReason": null, "voidedById": null, "changeAmount": "0", "currencyCode": "ILS", "transactionAt": "2026-07-19T18:52:23.026Z", "lastFourDigits": null, "settlementDate": null, "settlementStatus": "UNSETTLED", "posTerminalNumber": null, "changeCurrencyCode": null, "exchangeRateToBase": "1", "convertedAmountBase": "9.25", "transactionReference": null}], "subtotal": "9.25", "cashierId": "cmr97q8fk0002rs9nw154pmah", "createdAt": "2026-07-19T18:52:22.982Z", "orderType": "TAKEAWAY", "printJobs": [{"id": "cmrs5kjuo000juw9n2keqwyvu", "status": "PENDING", "jobType": "CUSTOMER_RECEIPT", "branchId": "cmr97q88n0000rs9nh4sethxg", "printDeviceId": "cmrs0kvf90002t89nnfc21r9f"}], "taxAmount": "0", "updatedAt": "2026-07-19T18:52:22.982Z", "discountId": null, "grandTotal": "9.25", "totalAmount": "9.25", "customerName": null, "kitchenOrder": null, "customerNotes": null, "customerPhone": null, "paymentMethod": "CASH", "discountAmount": "0", "idempotencyKey": "d93bd11f-e62d-4e91-9f2e-adc7bd007290", "officialNumber": "MAIN-REG-MAIN-01-2026-000021", "voidApprovedAt": null, "customerAddress": null, "voidRequestedAt": null, "voidApprovedById": null, "voidRequestedById": null, "cancellationReason": null, "clientTransactionId": "d93bd11f-e62d-4e91-9f2e-adc7bd007290"}	null	\N	\N	\N	\N
cmrs6mllk0007dg9n1bg2d9e1	cmr97q8fk0002rs9nw154pmah	INVOICE_CREATED	Invoice	cmrs6mlhe0001dg9n8x68yq83	{"total": 9.25, "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "payments": [{"amount": 9.25, "method": "CASH", "changeAmount": 0, "currencyCode": "ILS"}], "printJobs": 1, "cashDrawerJobs": 1}	2026-07-19 19:21:58.232	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	{"id": "cmrs6mlhe0001dg9n8x68yq83", "items": [{"id": "cmrs6mlhv0002dg9nwxvhamte", "addons": [], "quantity": 1, "invoiceId": "cmrs6mlhe0001dg9n8x68yq83", "productId": null, "unitPrice": "4.25", "categoryId": null, "totalPrice": "4.25", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "فستق مثلج", "selectedSizeSnapshot": "عادي"}, {"id": "cmrs6mli00003dg9n4rs9kkr0", "addons": [], "quantity": 1, "invoiceId": "cmrs6mlhe0001dg9n8x68yq83", "productId": null, "unitPrice": "5", "categoryId": null, "totalPrice": "5", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "تيراميسو", "selectedSizeSnapshot": null}], "number": "MAIN-REG-MAIN-01-2026-000022", "status": "PAID", "payment": {"id": "cmrs6mli10004dg9nnu31e6u0", "amount": "9.25", "method": "CASH", "paidAt": "2026-07-19T19:21:58.082Z", "status": "COMPLETED", "invoiceId": "cmrs6mlhe0001dg9n8x68yq83"}, "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "branchId": "cmr97q88n0000rs9nh4sethxg", "payments": [{"id": "cmrs6mlil0005dg9n2nd86sbo", "amount": "9.25", "method": "CASH", "paidAt": "2026-07-19T19:21:58.125Z", "status": "COMPLETED", "bankFee": "0", "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "bankName": null, "cardType": null, "provider": null, "invoiceId": "cmrs6mlhe0001dg9n8x68yq83", "currencyId": "cmropc0li0001do9npj34m7mp", "voidReason": null, "voidedById": null, "changeAmount": "0", "currencyCode": "ILS", "transactionAt": "2026-07-19T19:21:58.122Z", "lastFourDigits": null, "settlementDate": null, "settlementStatus": "UNSETTLED", "posTerminalNumber": null, "changeCurrencyCode": null, "exchangeRateToBase": "1", "convertedAmountBase": "9.25", "transactionReference": null}], "subtotal": "9.25", "cashierId": "cmr97q8fk0002rs9nw154pmah", "createdAt": "2026-07-19T19:21:58.082Z", "orderType": "TAKEAWAY", "printJobs": [{"id": "cmrs6mlku0006dg9n9fg8ezfk", "status": "PENDING", "jobType": "CUSTOMER_RECEIPT", "branchId": "cmr97q88n0000rs9nh4sethxg", "printDeviceId": "cmrs0kvf90002t89nnfc21r9f"}], "taxAmount": "0", "updatedAt": "2026-07-19T19:21:58.082Z", "discountId": null, "grandTotal": "9.25", "totalAmount": "9.25", "customerName": null, "kitchenOrder": null, "customerNotes": null, "customerPhone": null, "paymentMethod": "CASH", "discountAmount": "0", "idempotencyKey": "10db89dc-7781-4639-97ec-dc2fb7035427", "officialNumber": "MAIN-REG-MAIN-01-2026-000022", "voidApprovedAt": null, "customerAddress": null, "voidRequestedAt": null, "voidApprovedById": null, "voidRequestedById": null, "cancellationReason": null, "clientTransactionId": "10db89dc-7781-4639-97ec-dc2fb7035427"}	null	\N	\N	\N	\N
cmrs83x3o00077o9ngytn67c7	cmr97q8fk0002rs9nw154pmah	INVOICE_CREATED	Invoice	cmrs83x0y00017o9ns49130iy	{"total": 9.25, "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "payments": [{"amount": 9.25, "method": "CASH", "changeAmount": 0, "currencyCode": "ILS"}], "printJobs": 1, "cashDrawerJobs": 1}	2026-07-19 20:03:25.908	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	{"id": "cmrs83x0y00017o9ns49130iy", "items": [{"id": "cmrs83x1a00027o9nlfbzypa3", "addons": [], "quantity": 1, "invoiceId": "cmrs83x0y00017o9ns49130iy", "productId": null, "unitPrice": "4.25", "categoryId": null, "totalPrice": "4.25", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "فستق مثلج", "selectedSizeSnapshot": "عادي"}, {"id": "cmrs83x1i00037o9n766j7ub8", "addons": [], "quantity": 1, "invoiceId": "cmrs83x0y00017o9ns49130iy", "productId": null, "unitPrice": "5", "categoryId": null, "totalPrice": "5", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "تيراميسو", "selectedSizeSnapshot": null}], "number": "MAIN-REG-MAIN-01-2026-000024", "status": "PAID", "payment": {"id": "cmrs83x1j00047o9nesp8uopx", "amount": "9.25", "method": "CASH", "paidAt": "2026-07-19T20:03:25.810Z", "status": "COMPLETED", "invoiceId": "cmrs83x0y00017o9ns49130iy"}, "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "branchId": "cmr97q88n0000rs9nh4sethxg", "payments": [{"id": "cmrs83x2300057o9nll7zjoiw", "amount": "9.25", "method": "CASH", "paidAt": "2026-07-19T20:03:25.851Z", "status": "COMPLETED", "bankFee": "0", "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "bankName": null, "cardType": null, "provider": null, "invoiceId": "cmrs83x0y00017o9ns49130iy", "currencyId": "cmropc0li0001do9npj34m7mp", "voidReason": null, "voidedById": null, "changeAmount": "0", "currencyCode": "ILS", "transactionAt": "2026-07-19T20:03:25.850Z", "lastFourDigits": null, "settlementDate": null, "settlementStatus": "UNSETTLED", "posTerminalNumber": null, "changeCurrencyCode": null, "exchangeRateToBase": "1", "convertedAmountBase": "9.25", "transactionReference": null}], "subtotal": "9.25", "cashierId": "cmr97q8fk0002rs9nw154pmah", "createdAt": "2026-07-19T20:03:25.810Z", "orderType": "TAKEAWAY", "printJobs": [{"id": "cmrs83x2p00067o9n0xbvax1h", "status": "PENDING", "jobType": "CUSTOMER_RECEIPT", "branchId": "cmr97q88n0000rs9nh4sethxg", "printDeviceId": "cmrs0kvf90002t89nnfc21r9f"}], "taxAmount": "0", "updatedAt": "2026-07-19T20:03:25.810Z", "discountId": null, "grandTotal": "9.25", "totalAmount": "9.25", "customerName": "فثسف", "kitchenOrder": null, "customerNotes": "تاغبتعغفؤي", "customerPhone": "05294816", "paymentMethod": "CASH", "discountAmount": "0", "idempotencyKey": "33a78a9e-945e-4c70-950a-bbb164a6ff6d", "officialNumber": "MAIN-REG-MAIN-01-2026-000024", "voidApprovedAt": null, "customerAddress": null, "voidRequestedAt": null, "voidApprovedById": null, "voidRequestedById": null, "cancellationReason": null, "clientTransactionId": "33a78a9e-945e-4c70-950a-bbb164a6ff6d"}	null	\N	\N	\N	\N
cmrs8m6oq000bw89nxrl0ol6z	cmr97q8fk0002rs9nw154pmah	INVOICE_CREATED	Invoice	cmrs8m6jt0001w89neogjma52	{"total": 36.9, "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "payments": [{"amount": 36.9, "method": "CASH", "changeAmount": 0, "currencyCode": "ILS"}], "printJobs": 1, "cashDrawerJobs": 1}	2026-07-19 20:17:38.138	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	::1	{"id": "cmrs8m6jt0001w89neogjma52", "items": [{"id": "cmrs8m6k40002w89nraqpnkh2", "addons": [], "quantity": 1, "invoiceId": "cmrs8m6jt0001w89neogjma52", "productId": null, "unitPrice": "5", "categoryId": null, "totalPrice": "5", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "تيراميسو", "selectedSizeSnapshot": null}, {"id": "cmrs8m6k90003w89ngxxiebic", "addons": [], "quantity": 1, "invoiceId": "cmrs8m6jt0001w89neogjma52", "productId": null, "unitPrice": "9", "categoryId": null, "totalPrice": "9", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "مارغريتا", "selectedSizeSnapshot": "وسط"}, {"id": "cmrs8m6kb0004w89n39tpf5ql", "addons": [], "quantity": 1, "invoiceId": "cmrs8m6jt0001w89neogjma52", "productId": null, "unitPrice": "10.5", "categoryId": null, "totalPrice": "10.5", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "بيبروني حار", "selectedSizeSnapshot": "وسط"}, {"id": "cmrs8m6kb0005w89nqaeaq44t", "addons": [], "quantity": 1, "invoiceId": "cmrs8m6jt0001w89neogjma52", "productId": null, "unitPrice": "7.75", "categoryId": null, "totalPrice": "7.75", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "سلطة حلوم", "selectedSizeSnapshot": null}, {"id": "cmrs8m6kc0006w89nve6nbyi7", "addons": [], "quantity": 1, "invoiceId": "cmrs8m6jt0001w89neogjma52", "productId": null, "unitPrice": "4.25", "categoryId": null, "totalPrice": "4.25", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "فستق مثلج", "selectedSizeSnapshot": "عادي"}, {"id": "cmrs8m6kd0007w89n2g2m6sof", "addons": [], "quantity": 1, "invoiceId": "cmrs8m6jt0001w89neogjma52", "productId": null, "unitPrice": "4.5", "categoryId": null, "totalPrice": "4.5", "unitCostSnapshot": "0", "totalCostSnapshot": "0", "productNameSnapshot": "بطاطا محملة", "selectedSizeSnapshot": "صغير"}], "number": "MAIN-REG-MAIN-01-2026-000025", "status": "PAID", "payment": {"id": "cmrs8m6kd0008w89noyw32co7", "amount": "36.9", "method": "CASH", "paidAt": "2026-07-19T20:17:37.961Z", "status": "COMPLETED", "invoiceId": "cmrs8m6jt0001w89neogjma52"}, "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "branchId": "cmr97q88n0000rs9nh4sethxg", "payments": [{"id": "cmrs8m6l20009w89n99q844k9", "amount": "36.9", "method": "CASH", "paidAt": "2026-07-19T20:17:38.006Z", "status": "COMPLETED", "bankFee": "0", "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "bankName": null, "cardType": null, "provider": null, "invoiceId": "cmrs8m6jt0001w89neogjma52", "currencyId": "cmropc0li0001do9npj34m7mp", "voidReason": null, "voidedById": null, "changeAmount": "0", "currencyCode": "ILS", "transactionAt": "2026-07-19T20:17:38.004Z", "lastFourDigits": null, "settlementDate": null, "settlementStatus": "UNSETTLED", "posTerminalNumber": null, "changeCurrencyCode": null, "exchangeRateToBase": "1", "convertedAmountBase": "36.9", "transactionReference": null}], "subtotal": "41", "cashierId": "cmr97q8fk0002rs9nw154pmah", "createdAt": "2026-07-19T20:17:37.961Z", "orderType": "DELIVERY", "printJobs": [{"id": "cmrs8m6n9000aw89np74vlf3c", "status": "PENDING", "jobType": "CUSTOMER_RECEIPT", "branchId": "cmr97q88n0000rs9nh4sethxg", "printDeviceId": "cmrs0kvf90002t89nnfc21r9f"}], "taxAmount": "0", "updatedAt": "2026-07-19T20:17:37.961Z", "discountId": null, "grandTotal": "36.9", "totalAmount": "36.9", "customerName": "test", "kitchenOrder": null, "customerNotes": "test", "customerPhone": "0598746584", "paymentMethod": "CASH", "discountAmount": "4.1", "idempotencyKey": "4ac1e5cd-d07d-4033-8c8d-86b24eda9c9e", "officialNumber": "MAIN-REG-MAIN-01-2026-000025", "voidApprovedAt": null, "customerAddress": null, "voidRequestedAt": null, "voidApprovedById": null, "voidRequestedById": null, "cancellationReason": null, "clientTransactionId": "4ac1e5cd-d07d-4033-8c8d-86b24eda9c9e"}	null	\N	\N	\N	\N
cmvgmj6nr0008dw9nn9otauca	cmr97q8fk0002rs9nw154pmah	INVOICE_CREATED	Invoice	cmvgmj6ik0001dw9n2u8r4m4f	{"total": 12.75, "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "payments": [{"amount": 12.75, "method": "CASH", "changeAmount": 0, "currencyCode": "ILS"}], "printJobs": 1, "cashDrawerJobs": 1}	2026-10-20 11:52:47.991	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36	::1	{"id": "cmvgmj6ik0001dw9n2u8r4m4f", "items": [{"id": "cmvgmj6ji0002dw9n5mp1nm3m", "addons": [], "quantity": 1, "invoiceId": "cmvgmj6ik0001dw9n2u8r4m4f", "productId": "cmr97q8ga0005rs9njgs6t3wm", "unitPrice": "8.5", "categoryId": "cmr97q8fo0003rs9nzlwt08bq", "totalPrice": "8.5", "unitCostSnapshot": "1.38", "totalCostSnapshot": "1.38", "productNameSnapshot": "برغر الترفل", "selectedSizeSnapshot": "عادي"}, {"id": "cmvgmj6jw0003dw9ndgb0jm3a", "addons": [], "quantity": 1, "invoiceId": "cmvgmj6ik0001dw9n2u8r4m4f", "productId": "cmr97q8gj000crs9ndrraxovw", "unitPrice": "4.25", "categoryId": "cmr97q8fr0004rs9nehxt1w5w", "totalPrice": "4.25", "unitCostSnapshot": "0.13", "totalCostSnapshot": "0.13", "productNameSnapshot": "فستق �ثلج", "selectedSizeSnapshot": "عادي"}], "number": "MAIN-REG-MAIN-01-2026-000026", "status": "PAID", "payment": {"id": "cmvgmj6jx0004dw9nuhqxqqof", "amount": "12.75", "method": "CASH", "paidAt": "2026-10-20T11:52:47.804Z", "status": "COMPLETED", "invoiceId": "cmvgmj6ik0001dw9n2u8r4m4f"}, "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "branchId": "cmr97q88n0000rs9nh4sethxg", "payments": [{"id": "cmvgmj6ks0005dw9nxouyeifh", "amount": "12.75", "method": "CASH", "paidAt": "2026-10-20T11:52:47.884Z", "status": "COMPLETED", "bankFee": "0", "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "bankName": null, "cardType": null, "provider": null, "invoiceId": "cmvgmj6ik0001dw9n2u8r4m4f", "currencyId": "cmropc0li0001do9npj34m7mp", "voidReason": null, "voidedById": null, "changeAmount": "0", "currencyCode": "ILS", "transactionAt": "2026-10-20T11:52:47.303Z", "lastFourDigits": null, "settlementDate": null, "settlementStatus": "UNSETTLED", "posTerminalNumber": null, "changeCurrencyCode": null, "exchangeRateToBase": "1", "convertedAmountBase": "12.75", "transactionReference": null}], "subtotal": "12.75", "cashierId": "cmr97q8fk0002rs9nw154pmah", "createdAt": "2026-10-20T11:52:47.303Z", "orderType": "TAKEAWAY", "printJobs": [{"id": "cmvgmj6lu0007dw9nat6qmnjs", "status": "PENDING", "jobType": "CUSTOMER_RECEIPT", "branchId": "cmr97q88n0000rs9nh4sethxg", "printDeviceId": "cmrs0kvf90002t89nnfc21r9f"}], "taxAmount": "0", "updatedAt": "2026-10-20T11:52:47.804Z", "discountId": null, "grandTotal": "12.75", "totalAmount": "12.75", "customerName": null, "kitchenOrder": {"id": "cmvgmj6kx0006dw9ndgbvs2sv", "items": [{"size": "عادي", "addons": [], "quantity": 1, "productName": "برغر الترفل"}, {"size": "عادي", "addons": [], "quantity": 1, "productName": "فستق �ثلج"}], "notes": null, "status": "NEW", "branchId": "cmr97q88n0000rs9nh4sethxg", "createdAt": "2026-10-20T11:52:47.889Z", "invoiceId": "cmvgmj6ik0001dw9n2u8r4m4f", "orderType": "TAKEAWAY", "updatedAt": "2026-10-20T11:52:47.889Z", "showPrices": false, "cashierName": "Omar Khalil", "orderNumber": "KO-97167888"}, "customerNotes": null, "customerPhone": null, "paymentMethod": "CASH", "discountAmount": "0", "idempotencyKey": "a096323c-1792-4dff-bd68-1edb6f33510c", "officialNumber": "MAIN-REG-MAIN-01-2026-000026", "voidApprovedAt": null, "customerAddress": null, "voidRequestedAt": null, "voidApprovedById": null, "voidRequestedById": null, "cancellationReason": null, "clientTransactionId": "a096323c-1792-4dff-bd68-1edb6f33510c"}	null	\N	\N	\N	\N
cmvi38q97000d909nxrhf3xec	cmr97q8fk0002rs9nw154pmah	INVOICE_CREATED	Invoice	cmvi38q3q0001909njamdiw1q	{"total": 24.25, "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "payments": [{"amount": 24.25, "method": "CASH", "changeAmount": 0, "currencyCode": "ILS"}], "printJobs": 1, "cashDrawerJobs": 1}	2026-10-21 12:28:19.819	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36	::1	{"id": "cmvi38q3q0001909njamdiw1q", "items": [{"id": "cmvi38q4c0002909nxd2q06md", "addons": [{"id": "cmvi38q4x0003909n0ab3bldh", "nameSnapshot": "جبنة إضافية", "invoiceItemId": "cmvi38q4c0002909nxd2q06md", "priceSnapshot": "1"}, {"id": "cmvi38q4x0004909n4w7zbdbz", "nameSnapshot": "بدون بصل", "invoiceItemId": "cmvi38q4c0002909nxd2q06md", "priceSnapshot": "0"}], "quantity": 1, "invoiceId": "cmvi38q3q0001909njamdiw1q", "productId": "cmr97q8ga0005rs9njgs6t3wm", "unitPrice": "9.5", "categoryId": "cmr97q8fo0003rs9nzlwt08bq", "totalPrice": "9.5", "unitCostSnapshot": "1.38", "totalCostSnapshot": "1.38", "productNameSnapshot": "برغر الترفل", "selectedSizeSnapshot": "عادي"}, {"id": "cmvi38q520005909n641spu3z", "addons": [{"id": "cmvi38q540006909n0ex4gsy5", "nameSnapshot": "شوت إضافي", "invoiceItemId": "cmvi38q520005909n641spu3z", "priceSnapshot": "1"}], "quantity": 1, "invoiceId": "cmvi38q3q0001909njamdiw1q", "productId": "cmr97q8gj000crs9ndrraxovw", "unitPrice": "5.25", "categoryId": "cmr97q8fr0004rs9nehxt1w5w", "totalPrice": "5.25", "unitCostSnapshot": "0.13", "totalCostSnapshot": "0.13", "productNameSnapshot": "فستق �ثلج", "selectedSizeSnapshot": "عادي"}, {"id": "cmvi38q550007909n9cwf5kr4", "addons": [{"id": "cmvi38q560008909nb4sqmoy6", "nameSnapshot": "جبنة إضافية", "invoiceItemId": "cmvi38q550007909n9cwf5kr4", "priceSnapshot": "1"}], "quantity": 1, "invoiceId": "cmvi38q3q0001909njamdiw1q", "productId": "cmr97q8ga0005rs9njgs6t3wm", "unitPrice": "9.5", "categoryId": "cmr97q8fo0003rs9nzlwt08bq", "totalPrice": "9.5", "unitCostSnapshot": "1.38", "totalCostSnapshot": "1.38", "productNameSnapshot": "برغر الترفل", "selectedSizeSnapshot": "عادي"}], "number": "MAIN-REG-MAIN-01-2026-000027", "status": "PAID", "payment": {"id": "cmvi38q570009909nfu5qiepd", "amount": "24.25", "method": "CASH", "paidAt": "2026-10-21T12:28:19.622Z", "status": "COMPLETED", "invoiceId": "cmvi38q3q0001909njamdiw1q"}, "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "branchId": "cmr97q88n0000rs9nh4sethxg", "payments": [{"id": "cmvi38q5x000a909ng98dyo4w", "amount": "24.25", "method": "CASH", "paidAt": "2026-10-21T12:28:19.701Z", "status": "COMPLETED", "bankFee": "0", "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "bankName": null, "cardType": null, "provider": null, "invoiceId": "cmvi38q3q0001909njamdiw1q", "currencyId": "cmropc0li0001do9npj34m7mp", "voidReason": null, "voidedById": null, "changeAmount": "0", "currencyCode": "ILS", "transactionAt": "2026-10-21T12:28:18.765Z", "lastFourDigits": null, "settlementDate": null, "settlementStatus": "UNSETTLED", "posTerminalNumber": null, "changeCurrencyCode": null, "exchangeRateToBase": "1", "convertedAmountBase": "24.25", "transactionReference": null}], "subtotal": "24.25", "cashierId": "cmr97q8fk0002rs9nw154pmah", "createdAt": "2026-10-21T12:28:18.765Z", "orderType": "TAKEAWAY", "printJobs": [{"id": "cmvi38q7a000c909nmdelr0db", "status": "PENDING", "jobType": "CUSTOMER_RECEIPT", "branchId": "cmr97q88n0000rs9nh4sethxg", "printDeviceId": "cmrs0kvf90002t89nnfc21r9f"}], "taxAmount": "0", "updatedAt": "2026-10-21T12:28:19.622Z", "discountId": null, "grandTotal": "24.25", "totalAmount": "24.25", "customerName": null, "kitchenOrder": {"id": "cmvi38q61000b909n26rbwcgd", "items": [{"size": "عادي", "addons": [{"name": "جبنة إضافية", "price": 1}, {"name": "بدون بصل", "price": 0}], "quantity": 1, "productName": "برغر الترفل"}, {"size": "عادي", "addons": [{"name": "شوت إضافي", "price": 1}], "quantity": 1, "productName": "فستق �ثلج"}, {"size": "عادي", "addons": [{"name": "جبنة إضافية", "price": 1}], "quantity": 1, "productName": "برغر الترفل"}], "notes": null, "status": "NEW", "branchId": "cmr97q88n0000rs9nh4sethxg", "createdAt": "2026-10-21T12:28:19.705Z", "invoiceId": "cmvi38q3q0001909njamdiw1q", "orderType": "TAKEAWAY", "updatedAt": "2026-10-21T12:28:19.705Z", "showPrices": false, "cashierName": "Omar Khalil", "orderNumber": "KO-85699703"}, "customerNotes": null, "customerPhone": null, "paymentMethod": "CASH", "discountAmount": "0", "idempotencyKey": "14d61e5d-ff6c-4e3e-b19d-62c92e1c3216", "officialNumber": "MAIN-REG-MAIN-01-2026-000027", "voidApprovedAt": null, "customerAddress": null, "voidRequestedAt": null, "voidApprovedById": null, "voidRequestedById": null, "cancellationReason": null, "clientTransactionId": "14d61e5d-ff6c-4e3e-b19d-62c92e1c3216"}	null	\N	\N	\N	\N
cmvj6y27f0008es9nhrr8azt4	cmr97q8fk0002rs9nw154pmah	INVOICE_CREATED	Invoice	cmvj6y1xm0001es9nc5t1xv5m	{"total": 12.75, "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "payments": [{"amount": 12.75, "method": "CASH", "changeAmount": 0, "currencyCode": "ILS"}], "printJobs": 1, "cashDrawerJobs": 1}	2026-10-22 06:59:46.731	Mozilla/5.0 (Linux; Android 16; Pixel 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Mobile Safari/537.36	::1	{"id": "cmvj6y1xm0001es9nc5t1xv5m", "items": [{"id": "cmvj6y1ye0002es9nv6mhhkji", "addons": [], "quantity": 1, "invoiceId": "cmvj6y1xm0001es9nc5t1xv5m", "productId": "cmr97q8gj000crs9ndrraxovw", "unitPrice": "4.25", "categoryId": "cmr97q8fr0004rs9nehxt1w5w", "totalPrice": "4.25", "unitCostSnapshot": "0.13", "totalCostSnapshot": "0.13", "productNameSnapshot": "فستق �ثلج", "selectedSizeSnapshot": "عادي"}, {"id": "cmvj6y1z00003es9nvgb02ent", "addons": [], "quantity": 1, "invoiceId": "cmvj6y1xm0001es9nc5t1xv5m", "productId": "cmr97q8ga0005rs9njgs6t3wm", "unitPrice": "8.5", "categoryId": "cmr97q8fo0003rs9nzlwt08bq", "totalPrice": "8.5", "unitCostSnapshot": "1.38", "totalCostSnapshot": "1.38", "productNameSnapshot": "برغر الترفل", "selectedSizeSnapshot": "عادي"}], "number": "MAIN-REG-MAIN-01-2026-000028", "status": "PAID", "payment": {"id": "cmvj6y1z10004es9nn2bbn0gx", "amount": "12.75", "method": "CASH", "paidAt": "2026-10-22T06:59:46.378Z", "status": "COMPLETED", "invoiceId": "cmvj6y1xm0001es9nc5t1xv5m"}, "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "branchId": "cmr97q88n0000rs9nh4sethxg", "payments": [{"id": "cmvj6y20f0005es9n3rmfjt4f", "amount": "12.75", "method": "CASH", "paidAt": "2026-10-22T06:59:46.479Z", "status": "COMPLETED", "bankFee": "0", "shiftId": "cmrp3jgpv0004rw9nanbdyo2l", "bankName": null, "cardType": null, "provider": null, "invoiceId": "cmvj6y1xm0001es9nc5t1xv5m", "currencyId": "cmropc0li0001do9npj34m7mp", "voidReason": null, "voidedById": null, "changeAmount": "0", "currencyCode": "ILS", "transactionAt": "2026-10-22T06:59:45.853Z", "lastFourDigits": null, "settlementDate": null, "settlementStatus": "UNSETTLED", "posTerminalNumber": null, "changeCurrencyCode": null, "exchangeRateToBase": "1", "convertedAmountBase": "12.75", "transactionReference": null}], "subtotal": "12.75", "cashierId": "cmr97q8fk0002rs9nw154pmah", "createdAt": "2026-10-22T06:59:45.853Z", "orderType": "TAKEAWAY", "printJobs": [{"id": "cmvj6y25d0007es9n9fyuspi1", "status": "PENDING", "jobType": "CUSTOMER_RECEIPT", "branchId": "cmr97q88n0000rs9nh4sethxg", "printDeviceId": "cmrs0kvf90002t89nnfc21r9f"}], "taxAmount": "0", "updatedAt": "2026-10-22T06:59:46.378Z", "discountId": null, "grandTotal": "12.75", "totalAmount": "12.75", "customerName": null, "kitchenOrder": {"id": "cmvj6y20k0006es9nkq5f4oq7", "items": [{"size": "عادي", "addons": [], "quantity": 1, "productName": "فستق �ثلج"}, {"size": "عادي", "addons": [], "quantity": 1, "productName": "برغر الترفل"}], "notes": null, "status": "NEW", "branchId": "cmr97q88n0000rs9nh4sethxg", "createdAt": "2026-10-22T06:59:46.484Z", "invoiceId": "cmvj6y1xm0001es9nc5t1xv5m", "orderType": "TAKEAWAY", "updatedAt": "2026-10-22T06:59:46.484Z", "showPrices": false, "cashierName": "Omar Khalil", "orderNumber": "KO-52386483"}, "customerNotes": null, "customerPhone": null, "paymentMethod": "CASH", "discountAmount": "0", "idempotencyKey": "580f5da6-af86-41a0-b972-fe8a76b466e3", "officialNumber": "MAIN-REG-MAIN-01-2026-000028", "voidApprovedAt": null, "customerAddress": null, "voidRequestedAt": null, "voidApprovedById": null, "voidRequestedById": null, "cancellationReason": null, "clientTransactionId": "580f5da6-af86-41a0-b972-fe8a76b466e3"}	null	\N	\N	\N	\N
\.


--
-- TOC entry 5731 (class 0 OID 423841)
-- Dependencies: 219
-- Data for Name: Branch; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Branch" (id, name, "nameAr", code, address, active, "createdAt", "updatedAt") FROM stdin;
cmr97q88n0000rs9nh4sethxg	Main Branch	الفرع الرئيسي	MAIN	Ramallah, Palestine	t	2026-07-06 12:45:09.815	2026-07-06 12:45:09.815
\.


--
-- TOC entry 5777 (class 0 OID 448224)
-- Dependencies: 265
-- Data for Name: CashAdjustment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CashAdjustment" (id, "shiftId", type, amount, "currencyCode", reason, "createdById", "approvedById", "beforeValue", "afterValue", "createdAt") FROM stdin;
\.


--
-- TOC entry 5766 (class 0 OID 446138)
-- Dependencies: 254
-- Data for Name: CashNotification; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CashNotification" (id, "shiftId", "userId", type, title, message, metadata, "readAt", "createdAt") FROM stdin;
\.


--
-- TOC entry 5753 (class 0 OID 445914)
-- Dependencies: 241
-- Data for Name: CashRegister; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CashRegister" (id, name, number, "branchId", active, "createdAt", "updatedAt") FROM stdin;
cmropc0l50000do9nb75d0nfl	Main POS Register	REG-MAIN-01	cmr97q88n0000rs9nh4sethxg	t	2026-07-17 08:54:32.441	2026-07-17 08:54:32.441
\.


--
-- TOC entry 5754 (class 0 OID 445930)
-- Dependencies: 242
-- Data for Name: CashShift; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CashShift" (id, "shiftNumber", status, "branchId", "registerId", "employeeId", "openedAt", "closedAt", "openingTotalBase", "actualClosingTotalBase", "expectedClosingTotalBase", "differenceTotalBase", "openingRates", "closingRates", "previousShiftId", "employeeClosingNote", "managerPrivateNote", "managerEmployeeNote", "reviewStatus", "createdAt", "updatedAt", "managerAdditionBase", "managerAdditionById", "openingBalanceSource", "openingDiscrepancyBase", "openingNote", "posDeviceId", "previousCarryoverBase") FROM stdin;
cmrp3jgpv0004rw9nanbdyo2l	SH-302334527	OPEN	cmr97q88n0000rs9nh4sethxg	cmropc0l50000do9nb75d0nfl	cmr97q8fk0002rs9nw154pmah	2026-07-17 15:32:14.563	\N	1254.00	\N	\N	\N	[{"code": "ILS", "rateToBase": "1"}, {"code": "JOD", "rateToBase": "4.1"}, {"code": "USD", "rateToBase": "3"}]	\N	\N	\N	\N	\N	NEW	2026-07-17 15:32:14.563	2026-07-17 15:32:14.563	0.00	\N	PREVIOUS_SHIFT_CARRYOVER	0.00	\N	\N	0.00
\.


--
-- TOC entry 5733 (class 0 OID 423874)
-- Dependencies: 221
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Category" (id, "nameEn", "nameAr", active, "sortOrder", "createdAt", "updatedAt", "deletedAt", "deletedBy") FROM stdin;
cmr97q8fo0003rs9nzlwt08bq	Burgers	برغر	t	1	2026-07-06 12:45:10.068	2026-07-06 12:45:10.068	\N	\N
cmr97q8fr0004rs9nehxt1w5w	Drinks	مشروبات	t	2	2026-07-06 12:45:10.071	2026-07-06 12:45:10.071	\N	\N
cmre6rfsn0000jg9nnh3mz8eb	Burgers	برغر	t	1	2026-07-10 00:16:57.527	2026-07-10 00:16:57.527	\N	\N
cmre6rfst0001jg9n9sdq48aq	Drinks	مشروبات	t	2	2026-07-10 00:16:57.533	2026-07-10 00:16:57.533	\N	\N
cmropc0vd000qdo9ndnd6grqo	Burgers	برغر	t	1	2026-07-17 08:54:32.809	2026-07-17 08:54:32.809	\N	\N
cmropc0vm000rdo9ngxdx10rs	Drinks	مشروبات	t	2	2026-07-17 08:54:32.818	2026-07-17 08:54:32.818	\N	\N
\.


--
-- TOC entry 5783 (class 0 OID 465412)
-- Dependencies: 271
-- Data for Name: CategoryPrinterRoute; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CategoryPrinterRoute" (id, "categoryId", "printerConfigurationId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5750 (class 0 OID 445865)
-- Dependencies: 238
-- Data for Name: Currency; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Currency" (id, code, name, "nameAr", "isBase", active, "createdAt", "updatedAt") FROM stdin;
cmropc0li0001do9npj34m7mp	ILS	Israeli Shekel	شيكل إسرائيلي	t	t	2026-07-17 08:54:32.454	2026-07-17 08:54:32.454
cmropc0lp0002do9ndkrjww1o	USD	US Dollar	دولار أمريكي	f	t	2026-07-17 08:54:32.461	2026-07-17 08:54:32.461
cmropc0ls0003do9nrps924og	JOD	Jordanian Dinar	دينار أردني	f	t	2026-07-17 08:54:32.464	2026-07-17 08:54:32.464
\.


--
-- TOC entry 5752 (class 0 OID 445896)
-- Dependencies: 240
-- Data for Name: CurrencyDenomination; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CurrencyDenomination" (id, "currencyId", value, label, active, "sortOrder", "createdAt", "updatedAt") FROM stdin;
cmropc0lx0004do9nyukwc80j	cmropc0li0001do9npj34m7mp	200.00	200 ILS	t	0	2026-07-17 08:54:32.469	2026-07-17 08:54:32.469
cmropc0m50005do9nkddrudri	cmropc0li0001do9npj34m7mp	100.00	100 ILS	t	1	2026-07-17 08:54:32.477	2026-07-17 08:54:32.477
cmropc0m90006do9neyyt5j0c	cmropc0li0001do9npj34m7mp	50.00	50 ILS	t	2	2026-07-17 08:54:32.481	2026-07-17 08:54:32.481
cmropc0me0007do9n3a41qjui	cmropc0li0001do9npj34m7mp	20.00	20 ILS	t	3	2026-07-17 08:54:32.486	2026-07-17 08:54:32.486
cmropc0mj0008do9ns5mefr4s	cmropc0li0001do9npj34m7mp	10.00	10 ILS	t	4	2026-07-17 08:54:32.491	2026-07-17 08:54:32.491
cmropc0mm0009do9nw3gj5m4d	cmropc0li0001do9npj34m7mp	5.00	5 ILS	t	5	2026-07-17 08:54:32.494	2026-07-17 08:54:32.494
cmropc0mo000ado9ncoi7qm8h	cmropc0li0001do9npj34m7mp	2.00	2 ILS	t	6	2026-07-17 08:54:32.496	2026-07-17 08:54:32.496
cmropc0mq000bdo9n7xhpisq4	cmropc0li0001do9npj34m7mp	1.00	1 ILS	t	7	2026-07-17 08:54:32.498	2026-07-17 08:54:32.498
cmropc0ms000cdo9nkj34ga9c	cmropc0lp0002do9ndkrjww1o	100.00	100 USD	t	0	2026-07-17 08:54:32.5	2026-07-17 08:54:32.5
cmropc0mu000ddo9n7uvg0t4g	cmropc0lp0002do9ndkrjww1o	50.00	50 USD	t	1	2026-07-17 08:54:32.502	2026-07-17 08:54:32.502
cmropc0mw000edo9nez9f4kp2	cmropc0lp0002do9ndkrjww1o	20.00	20 USD	t	2	2026-07-17 08:54:32.504	2026-07-17 08:54:32.504
cmropc0mx000fdo9nbfdm0cio	cmropc0lp0002do9ndkrjww1o	10.00	10 USD	t	3	2026-07-17 08:54:32.505	2026-07-17 08:54:32.505
cmropc0my000gdo9no87s7kw1	cmropc0lp0002do9ndkrjww1o	5.00	5 USD	t	4	2026-07-17 08:54:32.506	2026-07-17 08:54:32.506
cmropc0mz000hdo9n89aljom4	cmropc0lp0002do9ndkrjww1o	1.00	1 USD	t	5	2026-07-17 08:54:32.507	2026-07-17 08:54:32.507
cmropc0n0000ido9nkhwuy7bj	cmropc0ls0003do9nrps924og	50.00	50 JOD	t	0	2026-07-17 08:54:32.508	2026-07-17 08:54:32.508
cmropc0n1000jdo9neb8aiofp	cmropc0ls0003do9nrps924og	20.00	20 JOD	t	1	2026-07-17 08:54:32.509	2026-07-17 08:54:32.509
cmropc0n2000kdo9nv7biwwqc	cmropc0ls0003do9nrps924og	10.00	10 JOD	t	2	2026-07-17 08:54:32.51	2026-07-17 08:54:32.51
cmropc0n3000ldo9nl1qw3zxw	cmropc0ls0003do9nrps924og	5.00	5 JOD	t	3	2026-07-17 08:54:32.511	2026-07-17 08:54:32.511
cmropc0n4000mdo9nj46j0jvz	cmropc0ls0003do9nrps924og	1.00	1 JOD	t	4	2026-07-17 08:54:32.512	2026-07-17 08:54:32.512
\.


--
-- TOC entry 5738 (class 0 OID 423942)
-- Dependencies: 226
-- Data for Name: DiscountCampaign; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."DiscountCampaign" (id, "nameEn", "nameAr", type, value, "startsAt", "endsAt", active, "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5751 (class 0 OID 445882)
-- Dependencies: 239
-- Data for Name: ExchangeRate; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ExchangeRate" (id, "currencyId", "rateToBase", "previousRate", "managerId", active, "createdAt") FROM stdin;
cmropc0n6000ndo9npq0fdigr	cmropc0li0001do9npj34m7mp	1.000000	\N	\N	t	2026-07-17 08:54:32.514
cmropc0nb000odo9nkqi61c5a	cmropc0lp0002do9ndkrjww1o	3.650000	\N	\N	f	2026-07-17 08:54:32.519
cmrp3cec40000rw9n9oxnrlgs	cmropc0lp0002do9ndkrjww1o	3.000000	3.650000	cmr97q8fb0001rs9nulxof0w3	t	2026-07-17 15:26:44.884
cmropc0nd000pdo9nzn22e49v	cmropc0ls0003do9nrps924og	5.150000	\N	\N	f	2026-07-17 08:54:32.521
cmrp3ck780002rw9nzilh0b42	cmropc0ls0003do9nrps924og	4.100000	5.150000	cmr97q8fb0001rs9nulxof0w3	t	2026-07-17 15:26:52.484
\.


--
-- TOC entry 5768 (class 0 OID 448050)
-- Dependencies: 256
-- Data for Name: ExpenseCategoryMaster; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ExpenseCategoryMaster" (id, "nameEn", "nameAr", active, "requiresApproval", "cashierLimit", "sortOrder", "deletedAt", "deletedBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5746 (class 0 OID 432611)
-- Dependencies: 234
-- Data for Name: Ingredient; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Ingredient" (id, "nameEn", "nameAr", unit, "purchaseCost", "purchaseQty", "unitCost", active, "createdAt", "updatedAt") FROM stdin;
cmre6rfu10002jg9n30dv8l4x	Beef patty	قطعة لحم	kg	42.0000	10.0000	4.2000	t	2026-07-10 00:16:57.577	2026-07-10 00:16:57.577
cmre6rfu70003jg9nhnm9vs1r	Brioche bun	خبز بريوش	piece	18.0000	60.0000	0.3000	t	2026-07-10 00:16:57.583	2026-07-10 00:16:57.583
cmre6rfua0004jg9n2dpks1wo	Truffle sauce	صوص ترفل	liter	16.0000	2.0000	8.0000	t	2026-07-10 00:16:57.586	2026-07-10 00:16:57.586
cmre6rfud0005jg9nqq4w4jsl	Espresso beans	حبوب قهوة	kg	28.0000	4.0000	7.0000	t	2026-07-10 00:16:57.589	2026-07-10 00:16:57.589
cmre71yqt0004509n3qdlm2tt	tesxt	beef	kg5	150.0000	10.0000	15.0000	t	2026-07-10 00:25:08.645	2026-07-10 00:25:08.645
cmropc0wq000sdo9noz0hmpx8	Beef patty	قطعة لحم	kg	42.0000	10.0000	4.2000	t	2026-07-17 08:54:32.858	2026-07-17 08:54:32.858
cmropc0wu000tdo9niraaizkv	Brioche bun	خبز بريوش	piece	18.0000	60.0000	0.3000	t	2026-07-17 08:54:32.862	2026-07-17 08:54:32.862
cmropc0ww000udo9n1zm8dw9h	Truffle sauce	صوص ترفل	liter	16.0000	2.0000	8.0000	t	2026-07-17 08:54:32.864	2026-07-17 08:54:32.864
cmropc0wy000vdo9nju3pl4wk	Espresso beans	حبوب قهوة	kg	28.0000	4.0000	7.0000	t	2026-07-17 08:54:32.866	2026-07-17 08:54:32.866
\.


--
-- TOC entry 5776 (class 0 OID 448208)
-- Dependencies: 264
-- Data for Name: InventoryMovement; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."InventoryMovement" (id, "productId", "branchId", quantity, unit, "movementType", "referenceType", "referenceId", notes, "createdById", "createdAt") FROM stdin;
\.


--
-- TOC entry 5739 (class 0 OID 423961)
-- Dependencies: 227
-- Data for Name: Invoice; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Invoice" (id, number, status, subtotal, "discountAmount", "totalAmount", "paymentMethod", "cashierId", "branchId", "discountId", "createdAt", "updatedAt", "shiftId", "cancellationReason", "clientTransactionId", "idempotencyKey", "officialNumber", "orderType", "voidApprovedAt", "voidApprovedById", "voidRequestedAt", "voidRequestedById", "customerAddress", "customerName", "customerNotes", "customerPhone", "grandTotal", "taxAmount") FROM stdin;
cmrs4j1at0001gk9ndsggw6an	MAIN-REG-MAIN-01-2026-000019	PAID	9.50	0.00	9.50	CASH	cmr97q8fk0002rs9nw154pmah	cmr97q88n0000rs9nh4sethxg	\N	2026-07-19 18:23:12.725	2026-07-19 18:23:12.725	cmrp3jgpv0004rw9nanbdyo2l	\N	3e0f71e6-378f-45ba-a9e5-afb3757ca28f	3e0f71e6-378f-45ba-a9e5-afb3757ca28f	MAIN-REG-MAIN-01-2026-000019	TAKEAWAY	\N	\N	\N	\N	\N	\N	\N	\N	9.50	0.00
cmrp3qc32000trw9nvfm9nwze	MAIN-REG-MAIN-01-2026-000001	PAID	27.25	0.00	27.25	CASH	cmr97q8fk0002rs9nw154pmah	cmr97q88n0000rs9nh4sethxg	\N	2026-07-17 15:37:35.15	2026-07-17 15:37:35.15	cmrp3jgpv0004rw9nanbdyo2l	\N	\N	\N	MAIN-REG-MAIN-01-2026-000001	PICKUP	\N	\N	\N	\N	\N	\N	\N	\N	27.25	0.00
cmrp4dbe40011rw9ngdftx11c	MAIN-REG-MAIN-01-2026-000002	PAID	18.25	0.00	18.25	CREDIT_CARD	cmr97q8fk0002rs9nw154pmah	cmr97q88n0000rs9nh4sethxg	\N	2026-07-17 15:55:27.34	2026-07-17 15:55:27.34	cmrp3jgpv0004rw9nanbdyo2l	\N	\N	\N	MAIN-REG-MAIN-01-2026-000002	PICKUP	\N	\N	\N	\N	\N	\N	\N	\N	18.25	0.00
cmrp4dlb80018rw9nnbtzumrb	MAIN-REG-MAIN-01-2026-000003	PAID	18.00	0.00	18.00	CASH	cmr97q8fk0002rs9nw154pmah	cmr97q88n0000rs9nh4sethxg	\N	2026-07-17 15:55:40.197	2026-07-17 15:55:40.197	cmrp3jgpv0004rw9nanbdyo2l	\N	\N	\N	MAIN-REG-MAIN-01-2026-000003	PICKUP	\N	\N	\N	\N	\N	\N	\N	\N	18.00	0.00
cmrp4s9oy001grw9ny5em13mm	MAIN-REG-MAIN-01-2026-000004	PAID	42.75	4.28	38.48	CASH	cmr97q8fk0002rs9nw154pmah	cmr97q88n0000rs9nh4sethxg	\N	2026-07-17 16:07:04.978	2026-07-17 16:07:28.348	cmrp3jgpv0004rw9nanbdyo2l	\N	\N	\N	MAIN-REG-MAIN-01-2026-000004	PICKUP	\N	\N	\N	\N	\N	\N	\N	\N	38.48	0.00
cmrps98am0001zk9naibwylq7	MAIN-REG-MAIN-01-2026-000005	PAID	24.50	0.00	24.50	CASH	cmr97q8fk0002rs9nw154pmah	cmr97q88n0000rs9nh4sethxg	\N	2026-07-18 03:04:07.486	2026-07-18 03:04:07.486	cmrp3jgpv0004rw9nanbdyo2l	\N	d5141366-dc3f-46e7-9366-455bd80c256a	5296f6ad-c41e-4412-8901-90c3cdb6668a	MAIN-REG-MAIN-01-2026-000005	DINE_IN	\N	\N	\N	\N	\N	mohamed	test	0598897496	24.50	0.00
cmrpsa77y0009zk9n0ml3ltpf	MAIN-REG-MAIN-01-2026-000006	PAID	16.25	0.00	16.25	CASH	cmr97q8fk0002rs9nw154pmah	cmr97q88n0000rs9nh4sethxg	\N	2026-07-18 03:04:52.75	2026-07-18 03:04:52.75	cmrp3jgpv0004rw9nanbdyo2l	\N	cd51c112-d38f-42a8-926c-a93b683245c8	73813eaf-f86b-4ed9-9205-d661d68fbd82	MAIN-REG-MAIN-01-2026-000006	DELIVERY	\N	\N	\N	\N	\N	mamoun	test 2	0598897496	16.25	0.00
cmrq3vje10001no9nikopjh0m	MAIN-REG-MAIN-01-2026-000007	PAID	18.50	0.00	18.50	CREDIT_CARD	cmr97q8fk0002rs9nw154pmah	cmr97q88n0000rs9nh4sethxg	\N	2026-07-18 08:29:24.073	2026-07-18 08:29:24.073	cmrp3jgpv0004rw9nanbdyo2l	\N	2594e0ad-66de-4aa4-b418-0d2d1315f5ec	01b80032-a365-4f55-a6d5-f9a74bdf14e6	MAIN-REG-MAIN-01-2026-000007	TAKEAWAY	\N	\N	\N	\N	\N	test	test	059897496	18.50	0.00
cmrq4dw1i0008no9nhyobumga	MAIN-REG-MAIN-01-2026-000008	PAID	18.25	0.00	18.25	CASH	cmr97q8fk0002rs9nw154pmah	cmr97q88n0000rs9nh4sethxg	\N	2026-07-18 08:43:40.278	2026-07-18 08:43:40.278	cmrp3jgpv0004rw9nanbdyo2l	\N	7e8d24db-49fa-4323-bf19-eb72be8f89b8	934fb8c6-759e-47b5-8057-99f1efcb1f18	MAIN-REG-MAIN-01-2026-000008	TAKEAWAY	\N	\N	\N	\N	\N	mamoun	test	0598897496	18.25	0.00
cmrqes5yy0001t49n99k64h8r	MAIN-REG-MAIN-01-2026-000009	PAID	24.75	0.00	24.75	CREDIT_CARD	cmr97q8fk0002rs9nw154pmah	cmr97q88n0000rs9nh4sethxg	\N	2026-07-18 13:34:42.49	2026-07-18 13:34:42.49	cmrp3jgpv0004rw9nanbdyo2l	\N	83eff6b8-5924-42a4-a388-2c9b6bc7de41	4bac92d4-4bf2-4c60-9693-a4a6907accb1	MAIN-REG-MAIN-01-2026-000009	DELIVERY	\N	\N	\N	\N	\N	test	test	0598898749	24.75	0.00
cmrrkcdj30001wk9nd7kn6k97	MAIN-REG-MAIN-01-2026-000010	PAID	21.75	0.00	21.75	CASH	cmr97q8fk0002rs9nw154pmah	cmr97q88n0000rs9nh4sethxg	\N	2026-07-19 08:58:09.663	2026-07-19 08:58:09.663	cmrp3jgpv0004rw9nanbdyo2l	\N	11828e00-8ebf-4d71-aa4d-de2bacc9a0cb	11828e00-8ebf-4d71-aa4d-de2bacc9a0cb	MAIN-REG-MAIN-01-2026-000010	TAKEAWAY	\N	\N	\N	\N	\N	1	\N	0598897496	21.75	0.00
cmrrkh7dr0009wk9nsilpb5j5	MAIN-REG-MAIN-01-2026-000011	PAID	5.00	0.00	5.00	CASH	cmr97q8fk0002rs9nw154pmah	cmr97q88n0000rs9nh4sethxg	\N	2026-07-19 09:01:54.975	2026-07-19 09:01:54.975	cmrp3jgpv0004rw9nanbdyo2l	\N	d6588fe3-83a5-4267-aeb4-5cbcb588b9ac	d6588fe3-83a5-4267-aeb4-5cbcb588b9ac	MAIN-REG-MAIN-01-2026-000011	TAKEAWAY	\N	\N	\N	\N	\N	\N	\N	\N	5.00	0.00
cmrrkw1zw0001i09nt305ldb5	MAIN-REG-MAIN-01-2026-000012	PAID	4.25	0.00	4.25	CASH	cmr97q8fk0002rs9nw154pmah	cmr97q88n0000rs9nh4sethxg	\N	2026-07-19 09:13:27.836	2026-07-19 09:13:27.836	cmrp3jgpv0004rw9nanbdyo2l	\N	fb6dfad5-7dde-4468-904f-073bce96d1a3	fb6dfad5-7dde-4468-904f-073bce96d1a3	MAIN-REG-MAIN-01-2026-000012	TAKEAWAY	\N	\N	\N	\N	\N	\N	\N	\N	4.25	0.00
cmrrl3p9a0007i09nbrkjjsvp	MAIN-REG-MAIN-01-2026-000013	PAID	11.25	0.00	11.25	CASH	cmr97q8fk0002rs9nw154pmah	cmr97q88n0000rs9nh4sethxg	\N	2026-07-19 09:19:24.575	2026-07-19 09:19:24.575	cmrp3jgpv0004rw9nanbdyo2l	\N	4d92ec44-62fb-400c-b51f-894ef372d937	4d92ec44-62fb-400c-b51f-894ef372d937	MAIN-REG-MAIN-01-2026-000013	TAKEAWAY	\N	\N	\N	\N	\N	\N	\N	\N	11.25	0.00
cmrs3i8620001jw9ncmj50u1w	MAIN-REG-MAIN-01-2026-000014	PAID	19.25	0.00	19.25	CASH	cmr97q8fk0002rs9nw154pmah	cmr97q88n0000rs9nh4sethxg	\N	2026-07-19 17:54:35.354	2026-07-19 17:54:35.354	cmrp3jgpv0004rw9nanbdyo2l	\N	6f42b2ed-f0ac-4354-8681-1b782f24b9d4	6f42b2ed-f0ac-4354-8681-1b782f24b9d4	MAIN-REG-MAIN-01-2026-000014	TAKEAWAY	\N	\N	\N	\N	\N	\N	\N	\N	19.25	0.00
cmrs3k8hh0009jw9nrotoxd1e	MAIN-REG-MAIN-01-2026-000015	PAID	8.75	0.00	8.75	CASH	cmr97q8fk0002rs9nw154pmah	cmr97q88n0000rs9nh4sethxg	\N	2026-07-19 17:56:09.077	2026-07-19 17:56:09.077	cmrp3jgpv0004rw9nanbdyo2l	\N	6602dc62-a8f2-443c-b770-ca5edf30f551	6602dc62-a8f2-443c-b770-ca5edf30f551	MAIN-REG-MAIN-01-2026-000015	TAKEAWAY	\N	\N	\N	\N	\N	\N	\N	\N	8.75	0.00
cmrs3t771000gjw9n8zo1g6p5	MAIN-REG-MAIN-01-2026-000016	PAID	12.25	0.00	12.25	CASH	cmr97q8fk0002rs9nw154pmah	cmr97q88n0000rs9nh4sethxg	\N	2026-07-19 18:03:07.309	2026-07-19 18:03:07.309	cmrp3jgpv0004rw9nanbdyo2l	\N	7a14ed93-826f-4a30-ac32-fbeed0dce355	7a14ed93-826f-4a30-ac32-fbeed0dce355	MAIN-REG-MAIN-01-2026-000016	TAKEAWAY	\N	\N	\N	\N	\N	\N	\N	\N	12.25	0.00
cmrs3v10k000njw9noylub518	MAIN-REG-MAIN-01-2026-000017	PAID	20.25	0.00	20.25	CASH	cmr97q8fk0002rs9nw154pmah	cmr97q88n0000rs9nh4sethxg	\N	2026-07-19 18:04:32.612	2026-07-19 18:04:32.612	cmrp3jgpv0004rw9nanbdyo2l	\N	a1e01b7f-b274-4493-aa70-b1f8d5de0b61	a1e01b7f-b274-4493-aa70-b1f8d5de0b61	MAIN-REG-MAIN-01-2026-000017	TAKEAWAY	\N	\N	\N	\N	\N	\N	\N	\N	20.25	0.00
cmrs4azpn0001cg9na8o6awqq	MAIN-REG-MAIN-01-2026-000018	PAID	16.75	0.00	16.75	CASH	cmr97q8fk0002rs9nw154pmah	cmr97q88n0000rs9nh4sethxg	\N	2026-07-19 18:16:57.42	2026-07-19 18:16:57.42	cmrp3jgpv0004rw9nanbdyo2l	\N	9585ee57-25d3-48ec-b4b3-2605722fa5f2	9585ee57-25d3-48ec-b4b3-2605722fa5f2	MAIN-REG-MAIN-01-2026-000018	TAKEAWAY	\N	\N	\N	\N	\N	\N	\N	\N	16.75	0.00
cmrs5f6rn0001uw9n5yczkqh6	MAIN-REG-MAIN-01-2026-000020	PAID	9.25	0.00	9.25	CASH	cmr97q8fk0002rs9nw154pmah	cmr97q88n0000rs9nh4sethxg	\N	2026-07-19 18:48:12.803	2026-07-19 18:48:12.803	cmrp3jgpv0004rw9nanbdyo2l	\N	e4178fa7-853a-41ce-b7a8-83ba272e0e96	e4178fa7-853a-41ce-b7a8-83ba272e0e96	MAIN-REG-MAIN-01-2026-000020	TAKEAWAY	\N	\N	\N	\N	\N	\N	\N	\N	9.25	0.00
cmrs5kjt2000euw9nyoi3rcln	MAIN-REG-MAIN-01-2026-000021	PAID	9.25	0.00	9.25	CASH	cmr97q8fk0002rs9nw154pmah	cmr97q88n0000rs9nh4sethxg	\N	2026-07-19 18:52:22.982	2026-07-19 18:52:22.982	cmrp3jgpv0004rw9nanbdyo2l	\N	d93bd11f-e62d-4e91-9f2e-adc7bd007290	d93bd11f-e62d-4e91-9f2e-adc7bd007290	MAIN-REG-MAIN-01-2026-000021	TAKEAWAY	\N	\N	\N	\N	\N	\N	\N	\N	9.25	0.00
cmrs6mlhe0001dg9n8x68yq83	MAIN-REG-MAIN-01-2026-000022	PAID	9.25	0.00	9.25	CASH	cmr97q8fk0002rs9nw154pmah	cmr97q88n0000rs9nh4sethxg	\N	2026-07-19 19:21:58.082	2026-07-19 19:21:58.082	cmrp3jgpv0004rw9nanbdyo2l	\N	10db89dc-7781-4639-97ec-dc2fb7035427	10db89dc-7781-4639-97ec-dc2fb7035427	MAIN-REG-MAIN-01-2026-000022	TAKEAWAY	\N	\N	\N	\N	\N	\N	\N	\N	9.25	0.00
cmrs7gn5m000fdg9nnlkwr5zk	MAIN-REG-MAIN-01-2026-000023	PAID	27.50	0.00	27.50	CASH	cmr97q8fk0002rs9nw154pmah	cmr97q88n0000rs9nh4sethxg	\N	2026-07-19 19:45:19.93	2026-07-19 19:45:19.93	cmrp3jgpv0004rw9nanbdyo2l	\N	0053dc75-7c9f-4d0f-a073-179d3b2aa34e	0053dc75-7c9f-4d0f-a073-179d3b2aa34e	MAIN-REG-MAIN-01-2026-000023	DELIVERY	\N	\N	\N	\N	\N	mamoun	mamoun	0598897496	27.50	0.00
cmrs83x0y00017o9ns49130iy	MAIN-REG-MAIN-01-2026-000024	PAID	9.25	0.00	9.25	CASH	cmr97q8fk0002rs9nw154pmah	cmr97q88n0000rs9nh4sethxg	\N	2026-07-19 20:03:25.81	2026-07-19 20:03:25.81	cmrp3jgpv0004rw9nanbdyo2l	\N	33a78a9e-945e-4c70-950a-bbb164a6ff6d	33a78a9e-945e-4c70-950a-bbb164a6ff6d	MAIN-REG-MAIN-01-2026-000024	TAKEAWAY	\N	\N	\N	\N	\N	فثسف	تاغبتعغفؤي	05294816	9.25	0.00
cmrs8m6jt0001w89neogjma52	MAIN-REG-MAIN-01-2026-000025	PAID	41.00	4.10	36.90	CASH	cmr97q8fk0002rs9nw154pmah	cmr97q88n0000rs9nh4sethxg	\N	2026-07-19 20:17:37.961	2026-07-19 20:17:37.961	cmrp3jgpv0004rw9nanbdyo2l	\N	4ac1e5cd-d07d-4033-8c8d-86b24eda9c9e	4ac1e5cd-d07d-4033-8c8d-86b24eda9c9e	MAIN-REG-MAIN-01-2026-000025	DELIVERY	\N	\N	\N	\N	\N	test	test	0598746584	36.90	0.00
cmvgmj6ik0001dw9n2u8r4m4f	MAIN-REG-MAIN-01-2026-000026	PAID	12.75	0.00	12.75	CASH	cmr97q8fk0002rs9nw154pmah	cmr97q88n0000rs9nh4sethxg	\N	2026-10-20 11:52:47.303	2026-10-20 11:52:47.804	cmrp3jgpv0004rw9nanbdyo2l	\N	a096323c-1792-4dff-bd68-1edb6f33510c	a096323c-1792-4dff-bd68-1edb6f33510c	MAIN-REG-MAIN-01-2026-000026	TAKEAWAY	\N	\N	\N	\N	\N	\N	\N	\N	12.75	0.00
cmvi38q3q0001909njamdiw1q	MAIN-REG-MAIN-01-2026-000027	PAID	24.25	0.00	24.25	CASH	cmr97q8fk0002rs9nw154pmah	cmr97q88n0000rs9nh4sethxg	\N	2026-10-21 12:28:18.765	2026-10-21 12:28:19.622	cmrp3jgpv0004rw9nanbdyo2l	\N	14d61e5d-ff6c-4e3e-b19d-62c92e1c3216	14d61e5d-ff6c-4e3e-b19d-62c92e1c3216	MAIN-REG-MAIN-01-2026-000027	TAKEAWAY	\N	\N	\N	\N	\N	\N	\N	\N	24.25	0.00
cmvj6y1xm0001es9nc5t1xv5m	MAIN-REG-MAIN-01-2026-000028	PAID	12.75	0.00	12.75	CASH	cmr97q8fk0002rs9nw154pmah	cmr97q88n0000rs9nh4sethxg	\N	2026-10-22 06:59:45.853	2026-10-22 06:59:46.378	cmrp3jgpv0004rw9nanbdyo2l	\N	580f5da6-af86-41a0-b972-fe8a76b466e3	580f5da6-af86-41a0-b972-fe8a76b466e3	MAIN-REG-MAIN-01-2026-000028	TAKEAWAY	\N	\N	\N	\N	\N	\N	\N	\N	12.75	0.00
\.


--
-- TOC entry 5740 (class 0 OID 423983)
-- Dependencies: 228
-- Data for Name: InvoiceItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."InvoiceItem" (id, "invoiceId", "productId", "categoryId", "productNameSnapshot", quantity, "unitPrice", "selectedSizeSnapshot", "totalPrice", "totalCostSnapshot", "unitCostSnapshot") FROM stdin;
cmrp3qc3a000urw9n0vsitwvu	cmrp3qc32000trw9nvfm9nwze	\N	\N	سلطة حلوم	1	7.75	\N	7.75	0.00	0.00
cmrp3qc3d000vrw9nlk8hz7rp	cmrp3qc32000trw9nvfm9nwze	\N	\N	بيبروني حار	1	10.50	وسط	10.50	0.00	0.00
cmrp3qc3e000wrw9n93dkvgzt	cmrp3qc32000trw9nvfm9nwze	\N	\N	مارغريتا	1	9.00	وسط	9.00	0.00	0.00
cmrp4dbel0012rw9nw1m6jvwm	cmrp4dbe40011rw9ngdftx11c	\N	\N	سلطة حلوم	1	7.75	\N	7.75	0.00	0.00
cmrp4dbev0013rw9nw31li7e5	cmrp4dbe40011rw9ngdftx11c	\N	\N	بيبروني حار	1	10.50	وسط	10.50	0.00	0.00
cmrp4dlbj0019rw9n57nibdqj	cmrp4dlb80018rw9nnbtzumrb	\N	\N	تيراميسو	1	5.00	\N	5.00	0.00	0.00
cmrp4dlbq001arw9nq21e8ivi	cmrp4dlb80018rw9nnbtzumrb	\N	\N	مارغريتا	1	13.00	كبير	13.00	0.00	0.00
cmrp4srq6001orw9n4l21c42f	cmrp4s9oy001grw9ny5em13mm	\N	\N	سلطة حلوم	1	7.75	\N	7.75	0.00	0.00
cmrp4srq8001prw9nprzvnkaz	cmrp4s9oy001grw9ny5em13mm	\N	\N	بيبروني حار	2	10.50	وسط	21.00	0.00	0.00
cmrp4srq8001qrw9ngb9z07lm	cmrp4s9oy001grw9ny5em13mm	\N	\N	مارغريتا	1	9.00	وسط	9.00	0.00	0.00
cmrp4srqa001rrw9nfb588p8c	cmrp4s9oy001grw9ny5em13mm	\N	\N	تيراميسو	1	5.00	\N	5.00	0.00	0.00
cmrps98b00002zk9nfbfcev3n	cmrps98am0001zk9naibwylq7	\N	\N	بيبروني حار	1	10.50	وسط	10.50	0.00	0.00
cmrps98b70003zk9nlimbqvum	cmrps98am0001zk9naibwylq7	\N	\N	مارغريتا	1	9.00	وسط	9.00	0.00	0.00
cmrps98b80004zk9nm8pnsi94	cmrps98am0001zk9naibwylq7	\N	\N	تيراميسو	1	5.00	\N	5.00	0.00	0.00
cmrpsa787000azk9nfo7nwct5	cmrpsa77y0009zk9n0ml3ltpf	\N	\N	فستق مثلج	1	6.25	كبير	6.25	0.00	0.00
cmrpsa78t000czk9n0duz23jx	cmrpsa77y0009zk9n0ml3ltpf	\N	\N	تيراميسو	2	5.00	\N	10.00	0.00	0.00
cmrq3vjek0002no9nv3cv0vns	cmrq3vje10001no9nikopjh0m	\N	\N	بيبروني حار	1	13.50	كبير	13.50	0.00	0.00
cmrq3vjeo0003no9ndizggft3	cmrq3vje10001no9nikopjh0m	\N	\N	تيراميسو	1	5.00	\N	5.00	0.00	0.00
cmrq4dw1o0009no9n01q6j2ua	cmrq4dw1i0008no9nhyobumga	\N	\N	مارغريتا	1	9.00	وسط	9.00	0.00	0.00
cmrq4dw1v000ano9nswem1k2a	cmrq4dw1i0008no9nhyobumga	\N	\N	فستق مثلج	1	4.25	عادي	4.25	0.00	0.00
cmrq4dw1x000bno9nkehminav	cmrq4dw1i0008no9nhyobumga	\N	\N	تيراميسو	1	5.00	\N	5.00	0.00	0.00
cmrqes5zk0002t49nlrdip3uc	cmrqes5yy0001t49n99k64h8r	\N	\N	تيراميسو	1	5.00	\N	5.00	0.00	0.00
cmrqes5zo0003t49nna0e6xqs	cmrqes5yy0001t49n99k64h8r	\N	\N	فستق مثلج	1	6.25	كبير	6.25	0.00	0.00
cmrqes5zs0005t49n1kd6rw0u	cmrqes5yy0001t49n99k64h8r	\N	\N	بيبروني حار	1	13.50	كبير	13.50	0.00	0.00
cmrrkcdjf0002wk9ncmvv1iwh	cmrrkcdj30001wk9nd7kn6k97	\N	\N	سلطة حلوم	1	7.75	\N	7.75	0.00	0.00
cmrrkcdjm0003wk9n3nbyy7qs	cmrrkcdj30001wk9nd7kn6k97	\N	\N	مارغريتا	1	9.00	وسط	9.00	0.00	0.00
cmrrkcdjn0004wk9noqib9rzp	cmrrkcdj30001wk9nd7kn6k97	\N	\N	تيراميسو	1	5.00	\N	5.00	0.00	0.00
cmrrkh7dz000awk9noj021y38	cmrrkh7dr0009wk9nsilpb5j5	\N	\N	تيراميسو	1	5.00	\N	5.00	0.00	0.00
cmrrkw2050002i09nqt8mn065	cmrrkw1zw0001i09nt305ldb5	\N	\N	فستق مثلج	1	4.25	عادي	4.25	0.00	0.00
cmrrl3p9l0008i09n8zqevtbl	cmrrl3p9a0007i09nbrkjjsvp	\N	\N	تيراميسو	1	5.00	\N	5.00	0.00	0.00
cmrrl3p9u0009i09nafqbiwdv	cmrrl3p9a0007i09nbrkjjsvp	\N	\N	فستق مثلج	1	6.25	كبير	6.25	0.00	0.00
cmrs3i86c0002jw9nw1eqe0i0	cmrs3i8620001jw9ncmj50u1w	\N	\N	فستق مثلج	1	4.25	عادي	4.25	0.00	0.00
cmrs3i86i0003jw9nyxckdyfk	cmrs3i8620001jw9ncmj50u1w	\N	\N	بطاطا محملة	1	4.50	صغير	4.50	0.00	0.00
cmrs3i86j0004jw9ngouyiu08	cmrs3i8620001jw9ncmj50u1w	\N	\N	بيبروني حار	1	10.50	وسط	10.50	0.00	0.00
cmrs3k8hm000ajw9nvh28p0lk	cmrs3k8hh0009jw9nrotoxd1e	\N	\N	فستق مثلج	1	4.25	عادي	4.25	0.00	0.00
cmrs3k8hr000bjw9ncknabxxy	cmrs3k8hh0009jw9nrotoxd1e	\N	\N	بطاطا محملة	1	4.50	صغير	4.50	0.00	0.00
cmrs3t794000hjw9nj9vpcav3	cmrs3t771000gjw9n8zo1g6p5	\N	\N	سلطة حلوم	1	7.75	\N	7.75	0.00	0.00
cmrs3t79c000ijw9ndycw89ej	cmrs3t771000gjw9n8zo1g6p5	\N	\N	بطاطا محملة	1	4.50	صغير	4.50	0.00	0.00
cmrs3v10r000ojw9na0mtj54a	cmrs3v10k000njw9noylub518	\N	\N	فستق مثلج	1	5.25	عادي	5.25	0.00	0.00
cmrs3v110000qjw9nqxqroyxt	cmrs3v10k000njw9noylub518	\N	\N	بطاطا محملة	1	4.50	صغير	4.50	0.00	0.00
cmrs3v111000rjw9n79ogem6s	cmrs3v10k000njw9noylub518	\N	\N	بيبروني حار	1	10.50	وسط	10.50	0.00	0.00
cmrs4azpx0002cg9neu5w7zni	cmrs4azpn0001cg9na8o6awqq	\N	\N	مارغريتا	1	9.00	وسط	9.00	0.00	0.00
cmrs4azpy0003cg9n4dd3vqn1	cmrs4azpn0001cg9na8o6awqq	\N	\N	سلطة حلوم	1	7.75	\N	7.75	0.00	0.00
cmrs4j1b10002gk9n7ms45uuw	cmrs4j1at0001gk9ndsggw6an	\N	\N	تيراميسو	1	5.00	\N	5.00	0.00	0.00
cmrs4j1b40003gk9nfvz7j6sv	cmrs4j1at0001gk9ndsggw6an	\N	\N	بطاطا محملة	1	4.50	صغير	4.50	0.00	0.00
cmrs5f6rv0002uw9ngaxy85jm	cmrs5f6rn0001uw9n5yczkqh6	\N	\N	تيراميسو	1	5.00	\N	5.00	0.00	0.00
cmrs5f6s00003uw9n6zx9i71b	cmrs5f6rn0001uw9n5yczkqh6	\N	\N	فستق مثلج	1	4.25	عادي	4.25	0.00	0.00
cmrs5kjtb000fuw9nxvz3fsxg	cmrs5kjt2000euw9nyoi3rcln	\N	\N	فستق مثلج	1	4.25	عادي	4.25	0.00	0.00
cmrs5kjtk000guw9nwdx8eeum	cmrs5kjt2000euw9nyoi3rcln	\N	\N	تيراميسو	1	5.00	\N	5.00	0.00	0.00
cmrs6mlhv0002dg9nwxvhamte	cmrs6mlhe0001dg9n8x68yq83	\N	\N	فستق مثلج	1	4.25	عادي	4.25	0.00	0.00
cmrs6mli00003dg9n4rs9kkr0	cmrs6mlhe0001dg9n8x68yq83	\N	\N	تيراميسو	1	5.00	\N	5.00	0.00	0.00
cmrs7gn5t000gdg9n5hea6cnz	cmrs7gn5m000fdg9nnlkwr5zk	\N	\N	سلطة حلوم	1	7.75	\N	7.75	0.00	0.00
cmrs7gn5w000hdg9n4knibekf	cmrs7gn5m000fdg9nnlkwr5zk	\N	\N	تيراميسو	1	5.00	\N	5.00	0.00	0.00
cmrs7gn5x000idg9n1mgu9hu8	cmrs7gn5m000fdg9nnlkwr5zk	\N	\N	فستق مثلج	1	4.25	عادي	4.25	0.00	0.00
cmrs7gn5y000jdg9noah7jydw	cmrs7gn5m000fdg9nnlkwr5zk	\N	\N	بيبروني حار	1	10.50	وسط	10.50	0.00	0.00
cmrs83x1a00027o9nlfbzypa3	cmrs83x0y00017o9ns49130iy	\N	\N	فستق مثلج	1	4.25	عادي	4.25	0.00	0.00
cmrs83x1i00037o9n766j7ub8	cmrs83x0y00017o9ns49130iy	\N	\N	تيراميسو	1	5.00	\N	5.00	0.00	0.00
cmrs8m6k40002w89nraqpnkh2	cmrs8m6jt0001w89neogjma52	\N	\N	تيراميسو	1	5.00	\N	5.00	0.00	0.00
cmrs8m6k90003w89ngxxiebic	cmrs8m6jt0001w89neogjma52	\N	\N	مارغريتا	1	9.00	وسط	9.00	0.00	0.00
cmrs8m6kb0004w89n39tpf5ql	cmrs8m6jt0001w89neogjma52	\N	\N	بيبروني حار	1	10.50	وسط	10.50	0.00	0.00
cmrs8m6kb0005w89nqaeaq44t	cmrs8m6jt0001w89neogjma52	\N	\N	سلطة حلوم	1	7.75	\N	7.75	0.00	0.00
cmrs8m6kc0006w89nve6nbyi7	cmrs8m6jt0001w89neogjma52	\N	\N	فستق مثلج	1	4.25	عادي	4.25	0.00	0.00
cmrs8m6kd0007w89n2g2m6sof	cmrs8m6jt0001w89neogjma52	\N	\N	بطاطا محملة	1	4.50	صغير	4.50	0.00	0.00
cmvgmj6ji0002dw9n5mp1nm3m	cmvgmj6ik0001dw9n2u8r4m4f	cmr97q8ga0005rs9njgs6t3wm	cmr97q8fo0003rs9nzlwt08bq	برغر الترفل	1	8.50	عادي	8.50	1.38	1.38
cmvgmj6jw0003dw9ndgb0jm3a	cmvgmj6ik0001dw9n2u8r4m4f	cmr97q8gj000crs9ndrraxovw	cmr97q8fr0004rs9nehxt1w5w	فستق �ثلج	1	4.25	عادي	4.25	0.13	0.13
cmvi38q4c0002909nxd2q06md	cmvi38q3q0001909njamdiw1q	cmr97q8ga0005rs9njgs6t3wm	cmr97q8fo0003rs9nzlwt08bq	برغر الترفل	1	9.50	عادي	9.50	1.38	1.38
cmvi38q520005909n641spu3z	cmvi38q3q0001909njamdiw1q	cmr97q8gj000crs9ndrraxovw	cmr97q8fr0004rs9nehxt1w5w	فستق �ثلج	1	5.25	عادي	5.25	0.13	0.13
cmvi38q550007909n9cwf5kr4	cmvi38q3q0001909njamdiw1q	cmr97q8ga0005rs9njgs6t3wm	cmr97q8fo0003rs9nzlwt08bq	برغر الترفل	1	9.50	عادي	9.50	1.38	1.38
cmvj6y1ye0002es9nv6mhhkji	cmvj6y1xm0001es9nc5t1xv5m	cmr97q8gj000crs9ndrraxovw	cmr97q8fr0004rs9nehxt1w5w	فستق �ثلج	1	4.25	عادي	4.25	0.13	0.13
cmvj6y1z00003es9nvgb02ent	cmvj6y1xm0001es9nc5t1xv5m	cmr97q8ga0005rs9njgs6t3wm	cmr97q8fo0003rs9nzlwt08bq	برغر الترفل	1	8.50	عادي	8.50	1.38	1.38
\.


--
-- TOC entry 5741 (class 0 OID 423996)
-- Dependencies: 229
-- Data for Name: InvoiceItemAddon; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."InvoiceItemAddon" (id, "invoiceItemId", "nameSnapshot", "priceSnapshot") FROM stdin;
cmrp4dlbr001brw9n3r1lrsy8	cmrp4dlbq001arw9nq21e8ivi	جبنة إضافية	1.00
cmrpsa78h000bzk9ngun4d163	cmrpsa787000azk9nfo7nwct5	شوت إضافي	1.00
cmrqes5zp0004t49n56cgi1e5	cmrqes5zo0003t49nna0e6xqs	شوت إضافي	1.00
cmrrl3p9v000ai09n65ipk6df	cmrrl3p9u0009i09nafqbiwdv	شوت إضافي	1.00
cmrs3v10x000pjw9ne5yweqay	cmrs3v10r000ojw9na0mtj54a	شوت إضافي	1.00
cmvi38q4x0003909n0ab3bldh	cmvi38q4c0002909nxd2q06md	جبنة إضافية	1.00
cmvi38q4x0004909n4w7zbdbz	cmvi38q4c0002909nxd2q06md	بدون بصل	0.00
cmvi38q540006909n0ex4gsy5	cmvi38q520005909n641spu3z	شوت إضافي	1.00
cmvi38q560008909nb4sqmoy6	cmvi38q550007909n9cwf5kr4	جبنة إضافية	1.00
\.


--
-- TOC entry 5759 (class 0 OID 446010)
-- Dependencies: 247
-- Data for Name: InvoicePayment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."InvoicePayment" (id, "invoiceId", "shiftId", method, "currencyId", "currencyCode", amount, "exchangeRateToBase", "convertedAmountBase", provider, "changeCurrencyCode", "changeAmount", "paidAt", "bankFee", "bankName", "cardType", "lastFourDigits", "posTerminalNumber", "settlementDate", "settlementStatus", status, "transactionAt", "transactionReference", "voidReason", "voidedById") FROM stdin;
cmrp3qc3r000yrw9n0rnexgq9	cmrp3qc32000trw9nvfm9nwze	cmrp3jgpv0004rw9nanbdyo2l	CASH	cmropc0li0001do9npj34m7mp	ILS	27.25	1.000000	27.25	\N	\N	0.00	2026-07-17 15:37:35.175	0.00	\N	\N	\N	\N	\N	UNSETTLED	COMPLETED	2026-07-17 15:37:35.173	\N	\N	\N
cmrp4dbf70015rw9n5a348l18	cmrp4dbe40011rw9ngdftx11c	cmrp3jgpv0004rw9nanbdyo2l	CREDIT_CARD	cmropc0li0001do9npj34m7mp	ILS	18.25	1.000000	18.25	\N	\N	0.00	2026-07-17 15:55:27.379	0.00	\N	VISA	\N	\N	\N	UNSETTLED	COMPLETED	2026-07-17 15:55:27.375	POS-1784303726897	\N	\N
cmrp4dlc9001drw9nv50hjwxr	cmrp4dlb80018rw9nnbtzumrb	cmrp3jgpv0004rw9nanbdyo2l	CASH	cmropc0li0001do9npj34m7mp	ILS	18.00	1.000000	18.00	\N	\N	0.00	2026-07-17 15:55:40.233	0.00	\N	\N	\N	\N	\N	UNSETTLED	COMPLETED	2026-07-17 15:55:40.23	\N	\N	\N
cmrp4srqq001trw9n956eqzpt	cmrp4s9oy001grw9ny5em13mm	cmrp3jgpv0004rw9nanbdyo2l	CASH	cmropc0li0001do9npj34m7mp	ILS	38.48	1.000000	38.48	\N	\N	0.00	2026-07-17 16:07:28.37	0.00	\N	\N	\N	\N	\N	UNSETTLED	COMPLETED	2026-07-17 16:07:28.365	\N	\N	\N
cmrps98bh0006zk9numdclvwi	cmrps98am0001zk9naibwylq7	cmrp3jgpv0004rw9nanbdyo2l	CASH	cmropc0li0001do9npj34m7mp	ILS	24.50	1.000000	24.50	\N	\N	0.00	2026-07-18 03:04:07.517	0.00	\N	\N	\N	\N	\N	UNSETTLED	COMPLETED	2026-07-18 03:04:07.514	\N	\N	\N
cmrpsa797000ezk9npfzkrsvv	cmrpsa77y0009zk9n0ml3ltpf	cmrp3jgpv0004rw9nanbdyo2l	CASH	cmropc0li0001do9npj34m7mp	ILS	16.25	1.000000	16.25	\N	\N	0.00	2026-07-18 03:04:52.795	0.00	\N	\N	\N	\N	\N	UNSETTLED	COMPLETED	2026-07-18 03:04:52.791	\N	\N	\N
cmrq3vjf30005no9ngnnalj33	cmrq3vje10001no9nikopjh0m	cmrp3jgpv0004rw9nanbdyo2l	CREDIT_CARD	cmropc0li0001do9npj34m7mp	ILS	18.50	1.000000	18.50	\N	\N	0.00	2026-07-18 08:29:24.112	0.00	\N	VISA	\N	\N	\N	UNSETTLED	COMPLETED	2026-07-18 08:29:24.108	POS-1784363363279	\N	\N
cmrq4dw2c000dno9n03e9oju3	cmrq4dw1i0008no9nhyobumga	cmrp3jgpv0004rw9nanbdyo2l	CASH	cmropc0li0001do9npj34m7mp	ILS	18.25	1.000000	18.25	\N	\N	0.00	2026-07-18 08:43:40.308	0.00	\N	\N	\N	\N	\N	UNSETTLED	COMPLETED	2026-07-18 08:43:40.303	\N	\N	\N
cmrqes6050007t49nq13oooh8	cmrqes5yy0001t49n99k64h8r	cmrp3jgpv0004rw9nanbdyo2l	CREDIT_CARD	cmropc0li0001do9npj34m7mp	ILS	24.75	1.000000	24.75	\N	\N	0.00	2026-07-18 13:34:42.533	0.00	\N	VISA	\N	\N	\N	UNSETTLED	COMPLETED	2026-07-18 13:34:42.53	POS-1784381681978	\N	\N
cmrrkcdjz0006wk9nhja2bqq0	cmrrkcdj30001wk9nd7kn6k97	cmrp3jgpv0004rw9nanbdyo2l	CASH	cmropc0li0001do9npj34m7mp	ILS	21.75	1.000000	21.75	\N	\N	0.00	2026-07-19 08:58:09.695	0.00	\N	\N	\N	\N	\N	UNSETTLED	COMPLETED	2026-07-19 08:58:09.692	\N	\N	\N
cmrrkh7eh000cwk9n7lqnyuyr	cmrrkh7dr0009wk9nsilpb5j5	cmrp3jgpv0004rw9nanbdyo2l	CASH	cmropc0li0001do9npj34m7mp	ILS	5.00	1.000000	5.00	\N	\N	0.00	2026-07-19 09:01:55.001	0.00	\N	\N	\N	\N	\N	UNSETTLED	COMPLETED	2026-07-19 09:01:54.999	\N	\N	\N
cmrrkw20d0004i09n6ta6i9eh	cmrrkw1zw0001i09nt305ldb5	cmrp3jgpv0004rw9nanbdyo2l	CASH	cmropc0li0001do9npj34m7mp	ILS	4.25	1.000000	4.25	\N	\N	0.00	2026-07-19 09:13:27.853	0.00	\N	\N	\N	\N	\N	UNSETTLED	COMPLETED	2026-07-19 09:13:27.851	\N	\N	\N
cmrrl3pad000ci09nnmrtl0h5	cmrrl3p9a0007i09nbrkjjsvp	cmrp3jgpv0004rw9nanbdyo2l	CASH	cmropc0li0001do9npj34m7mp	ILS	11.25	1.000000	11.25	\N	\N	0.00	2026-07-19 09:19:24.613	0.00	\N	\N	\N	\N	\N	UNSETTLED	COMPLETED	2026-07-19 09:19:24.607	\N	\N	\N
cmrs3i8750006jw9nc8n9dz1c	cmrs3i8620001jw9ncmj50u1w	cmrp3jgpv0004rw9nanbdyo2l	CASH	cmropc0li0001do9npj34m7mp	ILS	19.25	1.000000	19.25	\N	\N	0.00	2026-07-19 17:54:35.393	0.00	\N	\N	\N	\N	\N	UNSETTLED	COMPLETED	2026-07-19 17:54:35.391	\N	\N	\N
cmrs3k8id000djw9nhuspx5um	cmrs3k8hh0009jw9nrotoxd1e	cmrp3jgpv0004rw9nanbdyo2l	CASH	cmropc0li0001do9npj34m7mp	ILS	8.75	1.000000	8.75	\N	\N	0.00	2026-07-19 17:56:09.109	0.00	\N	\N	\N	\N	\N	UNSETTLED	COMPLETED	2026-07-19 17:56:09.107	\N	\N	\N
cmrs3t79x000kjw9noct4fe8r	cmrs3t771000gjw9n8zo1g6p5	cmrp3jgpv0004rw9nanbdyo2l	CASH	cmropc0li0001do9npj34m7mp	ILS	12.25	1.000000	12.25	\N	\N	0.00	2026-07-19 18:03:07.413	0.00	\N	\N	\N	\N	\N	UNSETTLED	COMPLETED	2026-07-19 18:03:07.41	\N	\N	\N
cmrs3v11i000tjw9npbjfgjeb	cmrs3v10k000njw9noylub518	cmrp3jgpv0004rw9nanbdyo2l	CASH	cmropc0li0001do9npj34m7mp	ILS	20.25	1.000000	20.25	\N	\N	0.00	2026-07-19 18:04:32.646	0.00	\N	\N	\N	\N	\N	UNSETTLED	COMPLETED	2026-07-19 18:04:32.644	\N	\N	\N
cmrs4azqf0005cg9nzx71r4u4	cmrs4azpn0001cg9na8o6awqq	cmrp3jgpv0004rw9nanbdyo2l	CASH	cmropc0li0001do9npj34m7mp	ILS	16.75	1.000000	16.75	\N	\N	0.00	2026-07-19 18:16:57.447	0.00	\N	\N	\N	\N	\N	UNSETTLED	COMPLETED	2026-07-19 18:16:57.445	\N	\N	\N
cmrs4j1bj0005gk9ng0axyyzb	cmrs4j1at0001gk9ndsggw6an	cmrp3jgpv0004rw9nanbdyo2l	CASH	cmropc0li0001do9npj34m7mp	ILS	9.50	1.000000	9.50	\N	\N	0.00	2026-07-19 18:23:12.751	0.00	\N	\N	\N	\N	\N	UNSETTLED	COMPLETED	2026-07-19 18:23:12.75	\N	\N	\N
cmrs5f6sj0005uw9nedjmm4ao	cmrs5f6rn0001uw9n5yczkqh6	cmrp3jgpv0004rw9nanbdyo2l	CASH	cmropc0li0001do9npj34m7mp	ILS	9.25	1.000000	9.25	\N	\N	0.00	2026-07-19 18:48:12.835	0.00	\N	\N	\N	\N	\N	UNSETTLED	COMPLETED	2026-07-19 18:48:12.832	\N	\N	\N
cmrs5kjub000iuw9npnfqs33i	cmrs5kjt2000euw9nyoi3rcln	cmrp3jgpv0004rw9nanbdyo2l	CASH	cmropc0li0001do9npj34m7mp	ILS	9.25	1.000000	9.25	\N	\N	0.00	2026-07-19 18:52:23.027	0.00	\N	\N	\N	\N	\N	UNSETTLED	COMPLETED	2026-07-19 18:52:23.026	\N	\N	\N
cmrs6mlil0005dg9n2nd86sbo	cmrs6mlhe0001dg9n8x68yq83	cmrp3jgpv0004rw9nanbdyo2l	CASH	cmropc0li0001do9npj34m7mp	ILS	9.25	1.000000	9.25	\N	\N	0.00	2026-07-19 19:21:58.125	0.00	\N	\N	\N	\N	\N	UNSETTLED	COMPLETED	2026-07-19 19:21:58.122	\N	\N	\N
cmrs7gn6c000ldg9nrcsk09on	cmrs7gn5m000fdg9nnlkwr5zk	cmrp3jgpv0004rw9nanbdyo2l	CASH	cmropc0li0001do9npj34m7mp	ILS	27.50	1.000000	27.50	\N	\N	0.00	2026-07-19 19:45:19.956	0.00	\N	\N	\N	\N	\N	UNSETTLED	COMPLETED	2026-07-19 19:45:19.954	\N	\N	\N
cmrs83x2300057o9nll7zjoiw	cmrs83x0y00017o9ns49130iy	cmrp3jgpv0004rw9nanbdyo2l	CASH	cmropc0li0001do9npj34m7mp	ILS	9.25	1.000000	9.25	\N	\N	0.00	2026-07-19 20:03:25.851	0.00	\N	\N	\N	\N	\N	UNSETTLED	COMPLETED	2026-07-19 20:03:25.85	\N	\N	\N
cmrs8m6l20009w89n99q844k9	cmrs8m6jt0001w89neogjma52	cmrp3jgpv0004rw9nanbdyo2l	CASH	cmropc0li0001do9npj34m7mp	ILS	36.90	1.000000	36.90	\N	\N	0.00	2026-07-19 20:17:38.006	0.00	\N	\N	\N	\N	\N	UNSETTLED	COMPLETED	2026-07-19 20:17:38.004	\N	\N	\N
cmvgmj6ks0005dw9nxouyeifh	cmvgmj6ik0001dw9n2u8r4m4f	cmrp3jgpv0004rw9nanbdyo2l	CASH	cmropc0li0001do9npj34m7mp	ILS	12.75	1.000000	12.75	\N	\N	0.00	2026-10-20 11:52:47.884	0.00	\N	\N	\N	\N	\N	UNSETTLED	COMPLETED	2026-10-20 11:52:47.303	\N	\N	\N
cmvi38q5x000a909ng98dyo4w	cmvi38q3q0001909njamdiw1q	cmrp3jgpv0004rw9nanbdyo2l	CASH	cmropc0li0001do9npj34m7mp	ILS	24.25	1.000000	24.25	\N	\N	0.00	2026-10-21 12:28:19.701	0.00	\N	\N	\N	\N	\N	UNSETTLED	COMPLETED	2026-10-21 12:28:18.765	\N	\N	\N
cmvj6y20f0005es9n3rmfjt4f	cmvj6y1xm0001es9nc5t1xv5m	cmrp3jgpv0004rw9nanbdyo2l	CASH	cmropc0li0001do9npj34m7mp	ILS	12.75	1.000000	12.75	\N	\N	0.00	2026-10-22 06:59:46.479	0.00	\N	\N	\N	\N	\N	UNSETTLED	COMPLETED	2026-10-22 06:59:45.853	\N	\N	\N
\.


--
-- TOC entry 5778 (class 0 OID 448242)
-- Dependencies: 266
-- Data for Name: InvoiceSequence; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."InvoiceSequence" (id, "branchId", "registerId", year, "lastNumber", "createdAt", "updatedAt") FROM stdin;
cmrp3qc1x000srw9ne9sznjbb	cmr97q88n0000rs9nh4sethxg	cmropc0l50000do9nb75d0nfl	2026	28	2026-07-17 15:37:35.109	2026-10-22 06:59:46.323
\.


--
-- TOC entry 5764 (class 0 OID 446103)
-- Dependencies: 252
-- Data for Name: KitchenOrder; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."KitchenOrder" (id, "orderNumber", "invoiceId", "branchId", "cashierName", "orderType", status, "showPrices", items, notes, "createdAt", "updatedAt") FROM stdin;
cmvgmj6kx0006dw9ndgbvs2sv	KO-97167888	cmvgmj6ik0001dw9n2u8r4m4f	cmr97q88n0000rs9nh4sethxg	Omar Khalil	TAKEAWAY	NEW	f	[{"size": "عادي", "addons": [], "quantity": 1, "productName": "برغر الترفل"}, {"size": "عادي", "addons": [], "quantity": 1, "productName": "فستق �ثلج"}]	\N	2026-10-20 11:52:47.889	2026-10-20 11:52:47.889
cmvi38q61000b909n26rbwcgd	KO-85699703	cmvi38q3q0001909njamdiw1q	cmr97q88n0000rs9nh4sethxg	Omar Khalil	TAKEAWAY	NEW	f	[{"size": "عادي", "addons": [{"name": "جبنة إضافية", "price": 1}, {"name": "بدون بصل", "price": 0}], "quantity": 1, "productName": "برغر الترفل"}, {"size": "عادي", "addons": [{"name": "شوت إضافي", "price": 1}], "quantity": 1, "productName": "فستق �ثلج"}, {"size": "عادي", "addons": [{"name": "جبنة إضافية", "price": 1}], "quantity": 1, "productName": "برغر الترفل"}]	\N	2026-10-21 12:28:19.705	2026-10-21 12:28:19.705
cmvj6y20k0006es9nkq5f4oq7	KO-52386483	cmvj6y1xm0001es9nc5t1xv5m	cmr97q88n0000rs9nh4sethxg	Omar Khalil	TAKEAWAY	NEW	f	[{"size": "عادي", "addons": [], "quantity": 1, "productName": "فستق �ثلج"}, {"size": "عادي", "addons": [], "quantity": 1, "productName": "برغر الترفل"}]	\N	2026-10-22 06:59:46.484	2026-10-22 06:59:46.484
\.


--
-- TOC entry 5748 (class 0 OID 432644)
-- Dependencies: 236
-- Data for Name: OperatingExpense; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."OperatingExpense" (id, title, category, frequency, amount, "expenseDate", notes, active, "branchId", "createdById", "createdAt", "updatedAt", "invoiceName", "invoiceUrl", "payrollRecordId", "approvalDate", "approvalStatus", "approvedById", "currencyCode", "exchangeRateToBase", "expenseCategoryId", "paymentMethod", "rejectionReason", "reversalOfId", source, "supplierId") FROM stdin;
cmre6rfv3000ajg9nqfnzmbww	Monthly rent	RENT	MONTHLY	1200.00	2026-07-01 00:00:00	\N	t	cmr97q88n0000rs9nh4sethxg	cmr97q8fb0001rs9nulxof0w3	2026-07-10 00:16:57.615	2026-07-10 00:16:57.615	\N	\N	\N	\N	APPROVED	\N	ILS	1.000000	\N	CASH	\N	\N	EXTERNAL_CASH	\N
cmre6rfv8000bjg9nm7f5m6bd	Electricity	ELECTRICITY	MONTHLY	420.00	2026-07-03 00:00:00	\N	t	cmr97q88n0000rs9nh4sethxg	cmr97q8fb0001rs9nulxof0w3	2026-07-10 00:16:57.62	2026-07-10 00:16:57.62	\N	\N	\N	\N	APPROVED	\N	ILS	1.000000	\N	CASH	\N	\N	EXTERNAL_CASH	\N
cmropc0xg0010do9n1rnfr9rp	Monthly rent	RENT	MONTHLY	1200.00	2026-07-01 00:00:00	\N	t	cmr97q88n0000rs9nh4sethxg	cmr97q8fb0001rs9nulxof0w3	2026-07-17 08:54:32.884	2026-07-17 08:54:32.884	\N	\N	\N	\N	APPROVED	\N	ILS	1.000000	\N	CASH	\N	\N	EXTERNAL_CASH	\N
cmropc0xn0011do9nit9x5dnh	Electricity	ELECTRICITY	MONTHLY	420.00	2026-07-03 00:00:00	\N	t	cmr97q88n0000rs9nh4sethxg	cmr97q8fb0001rs9nulxof0w3	2026-07-17 08:54:32.891	2026-07-17 08:54:32.891	\N	\N	\N	\N	APPROVED	\N	ILS	1.000000	\N	CASH	\N	\N	EXTERNAL_CASH	\N
\.


--
-- TOC entry 5767 (class 0 OID 448037)
-- Dependencies: 255
-- Data for Name: PasswordResetToken; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PasswordResetToken" (id, "userId", "tokenHash", "expiresAt", "usedAt", "createdAt") FROM stdin;
\.


--
-- TOC entry 5742 (class 0 OID 424007)
-- Dependencies: 230
-- Data for Name: Payment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Payment" (id, "invoiceId", method, amount, "paidAt", status) FROM stdin;
cmrp3qc3e000xrw9n10iq6na2	cmrp3qc32000trw9nvfm9nwze	CASH	27.25	2026-07-17 15:37:35.15	COMPLETED
cmrp4dbew0014rw9nipj3xg5m	cmrp4dbe40011rw9ngdftx11c	CREDIT_CARD	18.25	2026-07-17 15:55:27.34	COMPLETED
cmrp4dlby001crw9nwuk0mot0	cmrp4dlb80018rw9nnbtzumrb	CASH	18.00	2026-07-17 15:55:40.197	COMPLETED
cmrp4srqb001srw9n2qf56qlc	cmrp4s9oy001grw9ny5em13mm	CASH	38.48	2026-07-17 16:07:28.348	COMPLETED
cmrps98b90005zk9n7l9ybxxz	cmrps98am0001zk9naibwylq7	CASH	24.50	2026-07-18 03:04:07.486	COMPLETED
cmrpsa78u000dzk9n2egj7bxe	cmrpsa77y0009zk9n0ml3ltpf	CASH	16.25	2026-07-18 03:04:52.75	COMPLETED
cmrq3vjep0004no9noj1nywbu	cmrq3vje10001no9nikopjh0m	CREDIT_CARD	18.50	2026-07-18 08:29:24.073	COMPLETED
cmrq4dw1x000cno9nq3g1m8kf	cmrq4dw1i0008no9nhyobumga	CASH	18.25	2026-07-18 08:43:40.278	COMPLETED
cmrqes5zu0006t49n39p23kyj	cmrqes5yy0001t49n99k64h8r	CREDIT_CARD	24.75	2026-07-18 13:34:42.49	COMPLETED
cmrrkcdjo0005wk9nrofbos65	cmrrkcdj30001wk9nd7kn6k97	CASH	21.75	2026-07-19 08:58:09.663	COMPLETED
cmrrkh7e9000bwk9nanlw1tyu	cmrrkh7dr0009wk9nsilpb5j5	CASH	5.00	2026-07-19 09:01:54.975	COMPLETED
cmrrkw2060003i09nv759q8qj	cmrrkw1zw0001i09nt305ldb5	CASH	4.25	2026-07-19 09:13:27.836	COMPLETED
cmrrl3p9y000bi09nn63bc43t	cmrrl3p9a0007i09nbrkjjsvp	CASH	11.25	2026-07-19 09:19:24.575	COMPLETED
cmrs3i86k0005jw9n3aba8sqr	cmrs3i8620001jw9ncmj50u1w	CASH	19.25	2026-07-19 17:54:35.354	COMPLETED
cmrs3k8ht000cjw9neqf939d6	cmrs3k8hh0009jw9nrotoxd1e	CASH	8.75	2026-07-19 17:56:09.077	COMPLETED
cmrs3t79e000jjw9n2uenlx6a	cmrs3t771000gjw9n8zo1g6p5	CASH	12.25	2026-07-19 18:03:07.309	COMPLETED
cmrs3v111000sjw9nx0206bci	cmrs3v10k000njw9noylub518	CASH	20.25	2026-07-19 18:04:32.612	COMPLETED
cmrs4azpz0004cg9nmob6t0m7	cmrs4azpn0001cg9na8o6awqq	CASH	16.75	2026-07-19 18:16:57.42	COMPLETED
cmrs4j1b50004gk9nvbqgzm8n	cmrs4j1at0001gk9ndsggw6an	CASH	9.50	2026-07-19 18:23:12.725	COMPLETED
cmrs5f6s10004uw9n5dwxr2sj	cmrs5f6rn0001uw9n5yczkqh6	CASH	9.25	2026-07-19 18:48:12.803	COMPLETED
cmrs5kjtq000huw9n4wyu4c95	cmrs5kjt2000euw9nyoi3rcln	CASH	9.25	2026-07-19 18:52:22.982	COMPLETED
cmrs6mli10004dg9nnu31e6u0	cmrs6mlhe0001dg9n8x68yq83	CASH	9.25	2026-07-19 19:21:58.082	COMPLETED
cmrs7gn5y000kdg9n4uilyxs2	cmrs7gn5m000fdg9nnlkwr5zk	CASH	27.50	2026-07-19 19:45:19.93	COMPLETED
cmrs83x1j00047o9nesp8uopx	cmrs83x0y00017o9ns49130iy	CASH	9.25	2026-07-19 20:03:25.81	COMPLETED
cmrs8m6kd0008w89noyw32co7	cmrs8m6jt0001w89neogjma52	CASH	36.90	2026-07-19 20:17:37.961	COMPLETED
cmvgmj6jx0004dw9nuhqxqqof	cmvgmj6ik0001dw9n2u8r4m4f	CASH	12.75	2026-10-20 11:52:47.804	COMPLETED
cmvi38q570009909nfu5qiepd	cmvi38q3q0001909njamdiw1q	CASH	24.25	2026-10-21 12:28:19.622	COMPLETED
cmvj6y1z10004es9nn2bbn0gx	cmvj6y1xm0001es9nc5t1xv5m	CASH	12.75	2026-10-22 06:59:46.378	COMPLETED
\.


--
-- TOC entry 5749 (class 0 OID 432689)
-- Dependencies: 237
-- Data for Name: PayrollRecord; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PayrollRecord" (id, "employeeId", "payrollMonth", "baseSalary", overtime, bonuses, deductions, advances, "netSalary", "amountPaid", status, approved, "paymentDate", "createdAt", "updatedAt") FROM stdin;
cmreormow0000049nvkw4hzyk	cmr97q8fk0002rs9nw154pmah	2026-07-01 00:00:00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	UNPAID	t	\N	2026-07-10 08:40:59.552	2026-07-10 08:49:10.301
\.


--
-- TOC entry 5779 (class 0 OID 465341)
-- Dependencies: 267
-- Data for Name: PrintDevice; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PrintDevice" (id, "branchId", name, "deviceCode", "tokenHash", status, "operatingSystem", "appVersion", "localPrinters", "lastConnectedAt", "lastHeartbeatAt", "disabledAt", "createdAt", "updatedAt", "sseStatus", "lastEventAt", "lastFallbackPollAt", "lastPrinterRefreshAt") FROM stdin;
cmrs0kvf90002t89nnfc21r9f	cmr97q88n0000rs9nh4sethxg	Nova Print Agent	NPA-MRS0KVF6	6da48ce66d405048145769e51e06325116411d05cc5181592983182abf097e6e	ONLINE	Windows_NT 10.0.26200	1.0.0	[{"name": "OneNote (Desktop)", "displayName": "OneNote (Desktop)"}, {"name": "Microsoft Print to PDF", "displayName": "Microsoft Print to PDF"}]	2026-07-19 21:06:05.148	2026-07-19 21:06:35.041	\N	2026-07-19 16:32:39.957	2026-07-19 21:06:35.041	Connected	2026-07-19 21:06:29.82	2026-07-19 20:20:10.008	2026-07-19 21:06:05.219
\.


--
-- TOC entry 5784 (class 0 OID 465425)
-- Dependencies: 272
-- Data for Name: PrintJob; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PrintJob" (id, "branchId", "printDeviceId", "printerConfigurationId", "invoiceId", "kitchenOrderId", "originalPrintJobId", "jobType", "contentType", content, copies, "paperWidth", "customWidthMm", status, attempts, "maxAttempts", "errorCode", "errorMessage", "idempotencyKey", "createdAt", "sentAt", "processingAt", "printedAt", "failedAt", "cancelledAt", "cashDrawerOpened", "drawerErrorCode", "drawerErrorMessage", "openCashDrawer") FROM stdin;
cmrsaagwg0004wk9nwidlrrwh	cmr97q88n0000rs9nh4sethxg	cmrs0kvf90002t89nnfc21r9f	cmrs4db040007cg9nzhr3t2fc	cmrs8m6jt0001w89neogjma52	\N	cmrs8m6n9000aw89np74vlf3c	CUSTOMER_RECEIPT	HTML	<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>\n    :root{--receipt-width:60mm}@page{size:60mm auto;margin:0}*{box-sizing:border-box}\n    body.receipt-document{width:var(--receipt-width);margin:0;padding:0;background:#fff;color:#000;overflow:visible;font-family:Arial,Tahoma,"Segoe UI",sans-serif}\n    .receipt{width:var(--receipt-width);min-width:var(--receipt-width);max-width:var(--receipt-width);padding:4mm;box-sizing:border-box;font-family:Arial,Tahoma,"Segoe UI",sans-serif;font-size:11px;line-height:1.35;color:#000;background:#fff;overflow:visible;height:auto;max-height:none}\n    .receipt .logo{width:17mm;height:17mm;object-fit:contain;display:block;margin:0 auto 2mm}.receipt h1{font-size:17px;margin:0 0 1mm;text-align:center}.receipt p{margin:0 0 1mm}.receipt header,.receipt footer{text-align:center}\n    .receipt .center{text-align:center}.receipt .en{direction:ltr}.receipt .meta,.receipt .totals{border-top:1px dashed #000;border-bottom:1px dashed #000;margin:3mm 0;padding:2mm 0}\n    .receipt .row{display:flex;justify-content:space-between;align-items:flex-start;gap:3mm;margin:1mm 0}.receipt .row span:first-child{flex:0 0 auto}.receipt .value{overflow-wrap:anywhere;word-break:break-word;text-align:end;max-width:45mm}\n    .receipt .invoice-number{max-width:100%;overflow-wrap:anywhere;word-break:break-word;white-space:normal;direction:ltr;text-align:left}\n    .receipt table{width:100%;border-collapse:collapse}.receipt td{padding:1.5mm 0;vertical-align:top;border-bottom:1px dotted #999}.receipt .qty{width:9mm;font-weight:bold}.receipt .item-name{overflow-wrap:anywhere;word-break:break-word}.receipt .money{text-align:end;white-space:nowrap}\n    .receipt small{display:block;color:#333;margin-top:1mm}.receipt .strong{font-size:14px;font-weight:bold}.receipt footer{margin-top:4mm;font-size:10px}\n  </style></head><body class="receipt receipt-document">\n    <main class="receipt">\n      <header>\n        <img class="logo" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3QgeD0iNTQiIHk9IjQ2IiB3aWR0aD0iNDA0IiBoZWlnaHQ9IjQyMCIgcng9Ijg2IiBmaWxsPSIjRjg2ODAwIi8+PHBhdGggZD0iTTEzNSAxMjhoMjQyYzIyIDAgNDAgMTggNDAgNDB2MTI4YzAgMzEtMjUgNTYtNTYgNTZoLTRjLTI3IDAtNDktMjItNDktNDl2LTg3SDIwNHY4N2MwIDI3LTIyIDQ5LTQ5IDQ5aC00Yy0zMSAwLTU2LTI1LTU2LTU2VjE2OGMwLTIyIDE4LTQwIDQwLTQwWiIgZmlsbD0iI0ZGRkZGRiIvPjxwYXRoIGQ9Ik0yMDkgMTc0aDExOGwtMjEgODZjLTUgMjEgMiA0MyAxOCA1OGwxMyAxMkgyMTBjMjgtMzAgNDEtNjUgMzktMTA1bC00MC01MVoiIGZpbGw9IiNGODY4MDAiLz48cGF0aCBkPSJNMjAzIDE2OGgxMzhsLTEyIDQ2SDIxNmwtMTMtNDZaIiBmaWxsPSIjRkY4QTFGIi8+PHBhdGggZD0iTTIyMiAyMjNoNTJjMyAyNSAwIDUzLTkgODMiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIxMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTI5NCAyMjRjNiAzMyA2IDY3IDAgMTAxTTMyMCAyMjRjNSAzNCA1IDY4IDAgMTAxTTM0NSAyMjRjNCAzMiA0IDY1IDAgOTgiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIxMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTIwOSAzNTdjLTggMjQtMjAgNDMtMzkgNTdoMTUzYy0xNS0xMy0yNC0zMS0yNi01N0gyMDlaIiBmaWxsPSIjRkZGRkZGIi8+PC9zdmc+" alt="Sheikh Al Kar logo">\n        <h1>شيخ الكار</h1>\n        <p class="en center">Sheikh Al Kar</p>\n        <p>الفرع الرئيسي</p>\n        <p>Ramallah, Palestine</p>\n        \n        <p>الرقم الضريبي: <span dir="ltr">310048229</span></p>\n        <p><strong>REPRINT / إعادة طباعة</strong></p>\n      </header>\n      <section class="meta">\n        <div class="row"><span>الفاتورة</span><strong class="value invoice-number">#MAIN-REG-MAIN-01-2026-000025</strong></div>\n        <div class="row"><span>التاريخ</span><strong class="value ">19‏/7‏/2026</strong></div>\n        <div class="row"><span>الوقت</span><strong class="value ">11:17 م</strong></div>\n        <div class="row"><span>الموظف</span><strong class="value ">Omar Khalil</strong></div>\n        <div class="row"><span>الزبون</span><strong class="value ">test</strong></div>\n        <div class="row"><span>هاتف الزبون</span><strong class="value ">0598746584</strong></div>\n        <div class="row"><span>طريقة الدفع</span><strong class="value ">نقداً</strong></div>\n        <div class="row"><span>العملة</span><strong class="value ">ILS</strong></div>\n        <div class="row"><span>المدفوع</span><strong class="value ">ILS 36.90</strong></div>\n        <div class="row"><span>طريقة التسليم</span><strong class="value ">توصيل</strong></div>\n        <div class="row"><span>نوع الطلب</span><strong class="value ">توصيل</strong></div>\n        <div class="row"><span>ملاحظات</span><strong class="value ">test</strong></div>\n      </section>\n      <table><tbody>\n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>تيراميسو</strong>\n        \n        \n        \n        \n        <small>سعر الوحدة: ILS 5.00</small>\n      </td>\n      <td class="money">ILS 5.00</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>مارغريتا</strong>\n        \n        <small>وسط</small>\n        \n        \n        <small>سعر الوحدة: ILS 9.00</small>\n      </td>\n      <td class="money">ILS 9.00</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>بيبروني حار</strong>\n        \n        <small>وسط</small>\n        \n        \n        <small>سعر الوحدة: ILS 10.50</small>\n      </td>\n      <td class="money">ILS 10.50</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>سلطة حلوم</strong>\n        \n        \n        \n        \n        <small>سعر الوحدة: ILS 7.75</small>\n      </td>\n      <td class="money">ILS 7.75</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>فستق مثلج</strong>\n        \n        <small>عادي</small>\n        \n        \n        <small>سعر الوحدة: ILS 4.25</small>\n      </td>\n      <td class="money">ILS 4.25</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>بطاطا محملة</strong>\n        \n        <small>صغير</small>\n        \n        \n        <small>سعر الوحدة: ILS 4.50</small>\n      </td>\n      <td class="money">ILS 4.50</td>\n    </tr>\n  </tbody></table>\n      <section class="totals">\n        <div class="row "><span>المجموع</span><strong class="value">ILS 41.00</strong></div>\n        <div class="row "><span>الخصم</span><strong class="value">- ILS 4.10</strong></div>\n        \n        \n        \n        <div class="row strong"><span>الإجمالي</span><strong class="value">ILS 36.90</strong></div>\n        <div class="row "><span>المدفوع</span><strong class="value">ILS 36.90</strong></div>\n        \n      </section>\n      <footer>\n        <strong>شكراً لزيارتكم</strong>\n        <p>الأسعار تشمل الضريبة</p>\n        <p>الرقم الضريبي: <span dir="ltr">310048229</span></p>\n        <p class="invoice-number">cmrs8m6jt0001w89neogjma52</p>\n      </footer>\n    </main></body></html>	1	W80	\N	PRINTED	1	5	\N	\N	invoice:cmrs8m6jt0001w89neogjma52:receipt:reprint:1784495070733	2026-07-19 21:04:30.736	2026-07-19 21:06:05.244	2026-07-19 21:06:05.541	2026-07-19 21:06:06.839	\N	\N	f	\N	\N	f
cmrsacyyu0008wk9n7bbu2tau	cmr97q88n0000rs9nh4sethxg	cmrs0kvf90002t89nnfc21r9f	cmrs4db040007cg9nzhr3t2fc	cmrs8m6jt0001w89neogjma52	\N	cmrs8m6n9000aw89np74vlf3c	CUSTOMER_RECEIPT	HTML	<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>\n    :root{--receipt-width:60mm}@page{size:60mm auto;margin:0}*{box-sizing:border-box}\n    body.receipt-document{width:var(--receipt-width);margin:0;padding:0;background:#fff;color:#000;overflow:visible;font-family:Arial,Tahoma,"Segoe UI",sans-serif}\n    .receipt{width:var(--receipt-width);min-width:var(--receipt-width);max-width:var(--receipt-width);padding:4mm;box-sizing:border-box;font-family:Arial,Tahoma,"Segoe UI",sans-serif;font-size:11px;line-height:1.35;color:#000;background:#fff;overflow:visible;height:auto;max-height:none}\n    .receipt .logo{width:17mm;height:17mm;object-fit:contain;display:block;margin:0 auto 2mm}.receipt h1{font-size:17px;margin:0 0 1mm;text-align:center}.receipt p{margin:0 0 1mm}.receipt header,.receipt footer{text-align:center}\n    .receipt .center{text-align:center}.receipt .en{direction:ltr}.receipt .meta,.receipt .totals{border-top:1px dashed #000;border-bottom:1px dashed #000;margin:3mm 0;padding:2mm 0}\n    .receipt .row{display:flex;justify-content:space-between;align-items:flex-start;gap:3mm;margin:1mm 0}.receipt .row span:first-child{flex:0 0 auto}.receipt .value{overflow-wrap:anywhere;word-break:break-word;text-align:end;max-width:45mm}\n    .receipt .invoice-number{max-width:100%;overflow-wrap:anywhere;word-break:break-word;white-space:normal;direction:ltr;text-align:left}\n    .receipt table{width:100%;border-collapse:collapse}.receipt td{padding:1.5mm 0;vertical-align:top;border-bottom:1px dotted #999}.receipt .qty{width:9mm;font-weight:bold}.receipt .item-name{overflow-wrap:anywhere;word-break:break-word}.receipt .money{text-align:end;white-space:nowrap}\n    .receipt small{display:block;color:#333;margin-top:1mm}.receipt .strong{font-size:14px;font-weight:bold}.receipt footer{margin-top:4mm;font-size:10px}\n  </style></head><body class="receipt receipt-document">\n    <main class="receipt">\n      <header>\n        <img class="logo" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3QgeD0iNTQiIHk9IjQ2IiB3aWR0aD0iNDA0IiBoZWlnaHQ9IjQyMCIgcng9Ijg2IiBmaWxsPSIjRjg2ODAwIi8+PHBhdGggZD0iTTEzNSAxMjhoMjQyYzIyIDAgNDAgMTggNDAgNDB2MTI4YzAgMzEtMjUgNTYtNTYgNTZoLTRjLTI3IDAtNDktMjItNDktNDl2LTg3SDIwNHY4N2MwIDI3LTIyIDQ5LTQ5IDQ5aC00Yy0zMSAwLTU2LTI1LTU2LTU2VjE2OGMwLTIyIDE4LTQwIDQwLTQwWiIgZmlsbD0iI0ZGRkZGRiIvPjxwYXRoIGQ9Ik0yMDkgMTc0aDExOGwtMjEgODZjLTUgMjEgMiA0MyAxOCA1OGwxMyAxMkgyMTBjMjgtMzAgNDEtNjUgMzktMTA1bC00MC01MVoiIGZpbGw9IiNGODY4MDAiLz48cGF0aCBkPSJNMjAzIDE2OGgxMzhsLTEyIDQ2SDIxNmwtMTMtNDZaIiBmaWxsPSIjRkY4QTFGIi8+PHBhdGggZD0iTTIyMiAyMjNoNTJjMyAyNSAwIDUzLTkgODMiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIxMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTI5NCAyMjRjNiAzMyA2IDY3IDAgMTAxTTMyMCAyMjRjNSAzNCA1IDY4IDAgMTAxTTM0NSAyMjRjNCAzMiA0IDY1IDAgOTgiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIxMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTIwOSAzNTdjLTggMjQtMjAgNDMtMzkgNTdoMTUzYy0xNS0xMy0yNC0zMS0yNi01N0gyMDlaIiBmaWxsPSIjRkZGRkZGIi8+PC9zdmc+" alt="Sheikh Al Kar logo">\n        <h1>شيخ الكار</h1>\n        <p class="en center">Sheikh Al Kar</p>\n        <p>الفرع الرئيسي</p>\n        <p>Ramallah, Palestine</p>\n        \n        <p>الرقم الضريبي: <span dir="ltr">310048229</span></p>\n        <p><strong>REPRINT / إعادة طباعة</strong></p>\n      </header>\n      <section class="meta">\n        <div class="row"><span>الفاتورة</span><strong class="value invoice-number">#MAIN-REG-MAIN-01-2026-000025</strong></div>\n        <div class="row"><span>التاريخ</span><strong class="value ">19‏/7‏/2026</strong></div>\n        <div class="row"><span>الوقت</span><strong class="value ">11:17 م</strong></div>\n        <div class="row"><span>الموظف</span><strong class="value ">Omar Khalil</strong></div>\n        <div class="row"><span>الزبون</span><strong class="value ">test</strong></div>\n        <div class="row"><span>هاتف الزبون</span><strong class="value ">0598746584</strong></div>\n        <div class="row"><span>طريقة الدفع</span><strong class="value ">نقداً</strong></div>\n        <div class="row"><span>العملة</span><strong class="value ">ILS</strong></div>\n        <div class="row"><span>المدفوع</span><strong class="value ">ILS 36.90</strong></div>\n        <div class="row"><span>طريقة التسليم</span><strong class="value ">توصيل</strong></div>\n        <div class="row"><span>نوع الطلب</span><strong class="value ">توصيل</strong></div>\n        <div class="row"><span>ملاحظات</span><strong class="value ">test</strong></div>\n      </section>\n      <table><tbody>\n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>تيراميسو</strong>\n        \n        \n        \n        \n        <small>سعر الوحدة: ILS 5.00</small>\n      </td>\n      <td class="money">ILS 5.00</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>مارغريتا</strong>\n        \n        <small>وسط</small>\n        \n        \n        <small>سعر الوحدة: ILS 9.00</small>\n      </td>\n      <td class="money">ILS 9.00</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>بيبروني حار</strong>\n        \n        <small>وسط</small>\n        \n        \n        <small>سعر الوحدة: ILS 10.50</small>\n      </td>\n      <td class="money">ILS 10.50</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>سلطة حلوم</strong>\n        \n        \n        \n        \n        <small>سعر الوحدة: ILS 7.75</small>\n      </td>\n      <td class="money">ILS 7.75</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>فستق مثلج</strong>\n        \n        <small>عادي</small>\n        \n        \n        <small>سعر الوحدة: ILS 4.25</small>\n      </td>\n      <td class="money">ILS 4.25</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>بطاطا محملة</strong>\n        \n        <small>صغير</small>\n        \n        \n        <small>سعر الوحدة: ILS 4.50</small>\n      </td>\n      <td class="money">ILS 4.50</td>\n    </tr>\n  </tbody></table>\n      <section class="totals">\n        <div class="row "><span>المجموع</span><strong class="value">ILS 41.00</strong></div>\n        <div class="row "><span>الخصم</span><strong class="value">- ILS 4.10</strong></div>\n        \n        \n        \n        <div class="row strong"><span>الإجمالي</span><strong class="value">ILS 36.90</strong></div>\n        <div class="row "><span>المدفوع</span><strong class="value">ILS 36.90</strong></div>\n        \n      </section>\n      <footer>\n        <strong>شكراً لزيارتكم</strong>\n        <p>الأسعار تشمل الضريبة</p>\n        <p>الرقم الضريبي: <span dir="ltr">310048229</span></p>\n        <p class="invoice-number">cmrs8m6jt0001w89neogjma52</p>\n      </footer>\n    </main></body></html>	1	W80	\N	PRINTED	1	5	\N	\N	invoice:cmrs8m6jt0001w89neogjma52:receipt:reprint:1784495187459	2026-07-19 21:06:27.462	2026-07-19 21:06:27.543	2026-07-19 21:06:28.162	2026-07-19 21:06:29.803	\N	\N	f	\N	\N	f
cmvgmj6lu0007dw9nat6qmnjs	cmr97q88n0000rs9nh4sethxg	cmrs0kvf90002t89nnfc21r9f	cmrs4db040007cg9nzhr3t2fc	cmvgmj6ik0001dw9n2u8r4m4f	\N	\N	CUSTOMER_RECEIPT	HTML	<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>\n    :root{--receipt-width:60mm}@page{size:60mm auto;margin:0}*{box-sizing:border-box}\n    body.receipt-document{width:var(--receipt-width);margin:0;padding:0;background:#fff;color:#000;overflow:visible;font-family:Arial,Tahoma,"Segoe UI",sans-serif}\n    .receipt{width:var(--receipt-width);min-width:var(--receipt-width);max-width:var(--receipt-width);padding:4mm;box-sizing:border-box;font-family:Arial,Tahoma,"Segoe UI",sans-serif;font-size:11px;line-height:1.35;color:#000;background:#fff;overflow:visible;height:auto;max-height:none}\n    .receipt .logo{width:17mm;height:17mm;object-fit:contain;display:block;margin:0 auto 2mm}.receipt h1{font-size:17px;margin:0 0 1mm;text-align:center}.receipt p{margin:0 0 1mm}.receipt header,.receipt footer{text-align:center}\n    .receipt .center{text-align:center}.receipt .en{direction:ltr}.receipt .meta,.receipt .totals{border-top:1px dashed #000;border-bottom:1px dashed #000;margin:3mm 0;padding:2mm 0}\n    .receipt .row{display:flex;justify-content:space-between;align-items:flex-start;gap:3mm;margin:1mm 0}.receipt .row span:first-child{flex:0 0 auto}.receipt .value{overflow-wrap:anywhere;word-break:break-word;text-align:end;max-width:45mm}\n    .receipt .invoice-number{max-width:100%;overflow-wrap:anywhere;word-break:break-word;white-space:normal;direction:ltr;text-align:left}\n    .receipt table{width:100%;border-collapse:collapse}.receipt td{padding:1.5mm 0;vertical-align:top;border-bottom:1px dotted #999}.receipt .qty{width:9mm;font-weight:bold}.receipt .item-name{overflow-wrap:anywhere;word-break:break-word}.receipt .money{text-align:end;white-space:nowrap}\n    .receipt small{display:block;color:#333;margin-top:1mm}.receipt .strong{font-size:14px;font-weight:bold}.receipt footer{margin-top:4mm;font-size:10px}\n  </style></head><body class="receipt receipt-document">\n    <main class="receipt">\n      <header>\n        <img class="logo" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3QgeD0iNTQiIHk9IjQ2IiB3aWR0aD0iNDA0IiBoZWlnaHQ9IjQyMCIgcng9Ijg2IiBmaWxsPSIjRjg2ODAwIi8+PHBhdGggZD0iTTEzNSAxMjhoMjQyYzIyIDAgNDAgMTggNDAgNDB2MTI4YzAgMzEtMjUgNTYtNTYgNTZoLTRjLTI3IDAtNDktMjItNDktNDl2LTg3SDIwNHY4N2MwIDI3LTIyIDQ5LTQ5IDQ5aC00Yy0zMSAwLTU2LTI1LTU2LTU2VjE2OGMwLTIyIDE4LTQwIDQwLTQwWiIgZmlsbD0iI0ZGRkZGRiIvPjxwYXRoIGQ9Ik0yMDkgMTc0aDExOGwtMjEgODZjLTUgMjEgMiA0MyAxOCA1OGwxMyAxMkgyMTBjMjgtMzAgNDEtNjUgMzktMTA1bC00MC01MVoiIGZpbGw9IiNGODY4MDAiLz48cGF0aCBkPSJNMjAzIDE2OGgxMzhsLTEyIDQ2SDIxNmwtMTMtNDZaIiBmaWxsPSIjRkY4QTFGIi8+PHBhdGggZD0iTTIyMiAyMjNoNTJjMyAyNSAwIDUzLTkgODMiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIxMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTI5NCAyMjRjNiAzMyA2IDY3IDAgMTAxTTMyMCAyMjRjNSAzNCA1IDY4IDAgMTAxTTM0NSAyMjRjNCAzMiA0IDY1IDAgOTgiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIxMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTIwOSAzNTdjLTggMjQtMjAgNDMtMzkgNTdoMTUzYy0xNS0xMy0yNC0zMS0yNi01N0gyMDlaIiBmaWxsPSIjRkZGRkZGIi8+PC9zdmc+" alt="Sheikh Al Kar logo">\n        <h1>شيخ الكار</h1>\n        <p class="en center">Sheikh Al Kar</p>\n        <p>الفرع الرئيسي</p>\n        <p>Ramallah, Palestine</p>\n        \n        <p>الرقم الضريبي: <span dir="ltr">310048229</span></p>\n        \n      </header>\n      <section class="meta">\n        <div class="row"><span>الفاتورة</span><strong class="value invoice-number">#MAIN-REG-MAIN-01-2026-000026</strong></div>\n        <div class="row"><span>التاريخ</span><strong class="value ">20‏/10‏/2026</strong></div>\n        <div class="row"><span>الوقت</span><strong class="value ">02:52 م</strong></div>\n        <div class="row"><span>الموظف</span><strong class="value ">Omar Khalil</strong></div>\n        \n        \n        <div class="row"><span>طريقة الدفع</span><strong class="value ">نقداً</strong></div>\n        <div class="row"><span>العملة</span><strong class="value ">ILS</strong></div>\n        <div class="row"><span>المدفوع</span><strong class="value ">ILS 12.75</strong></div>\n        <div class="row"><span>طريقة التسليم</span><strong class="value ">سفري</strong></div>\n        <div class="row"><span>نوع الطلب</span><strong class="value ">سفري</strong></div>\n        \n      </section>\n      <table><tbody>\n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>برغر الترفل</strong>\n        <small class="en">Truffle Smash</small>\n        <small>عادي</small>\n        \n        \n        <small>سعر الوحدة: ILS 8.50</small>\n      </td>\n      <td class="money">ILS 8.50</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>فستق �ثلج</strong>\n        <small class="en">Iced Pistachio</small>\n        <small>عادي</small>\n        \n        \n        <small>سعر الوحدة: ILS 4.25</small>\n      </td>\n      <td class="money">ILS 4.25</td>\n    </tr>\n  </tbody></table>\n      <section class="totals">\n        <div class="row "><span>المجموع</span><strong class="value">ILS 12.75</strong></div>\n        \n        \n        \n        \n        <div class="row strong"><span>الإجمالي</span><strong class="value">ILS 12.75</strong></div>\n        <div class="row "><span>المدفوع</span><strong class="value">ILS 12.75</strong></div>\n        \n      </section>\n      <footer>\n        <strong>شكراً لزيارتكم</strong>\n        <p>الأسعار تشمل الضريبة</p>\n        <p>الرقم الضريبي: <span dir="ltr">310048229</span></p>\n        <p class="invoice-number">cmvgmj6ik0001dw9n2u8r4m4f</p>\n      </footer>\n    </main></body></html>	1	W80	\N	PENDING	0	5	\N	\N	invoice:cmvgmj6ik0001dw9n2u8r4m4f:receipt:cmrs4db040007cg9nzhr3t2fc	2026-10-20 11:52:47.923	\N	\N	\N	\N	\N	f	\N	\N	f
cmrs4db0r0008cg9net5xm4va	cmr97q88n0000rs9nh4sethxg	cmrs0kvf90002t89nnfc21r9f	cmrs4db040007cg9nzhr3t2fc	cmrs4azpn0001cg9na8o6awqq	\N	\N	CUSTOMER_RECEIPT	HTML	<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>\n    @page{margin:0;size:80mm auto}*{box-sizing:border-box}html,body{width:80mm;margin:0;padding:0;background:#fff;color:#000;font-family:Arial,Tahoma,sans-serif}\n    body{padding:4mm;font-size:11px;line-height:1.35}.ticket body{font-size:13px}h1{font-size:17px;margin:0 0 2mm;text-align:center}p{margin:0}header{text-align:center}\n    .meta,.totals{border-top:1px dashed #000;border-bottom:1px dashed #000;margin:3mm 0;padding:2mm 0}.line{display:flex;justify-content:space-between;gap:3mm}.line strong{font-size:14px}\n    table{width:100%;border-collapse:collapse}td{padding:1.5mm 0;vertical-align:top;border-bottom:1px dotted #999}.qty{width:9mm;font-weight:bold}.money{text-align:end;white-space:nowrap}small{display:block;color:#333;margin-top:1mm}footer{text-align:center;margin-top:4mm;font-weight:bold}\n  </style></head><body class="receipt">\n    <header>\n      <h1>شيخ الكار</h1>\n      <p>الفرع الرئيسي - Ramallah, Palestine</p>\n    <p><strong>REPRINT / إعادة طباعة</strong></p></header>\n    <section class="meta">\n      <div class="line "><span>الفاتورة</span><strong>#MAIN-REG-MAIN-01-2026-000018</strong></div>\n      <div class="line "><span>الطلب</span><strong>-</strong></div>\n      <div class="line "><span>الكاشير</span><strong>Omar Khalil</strong></div>\n      <div class="line "><span>الوقت</span><strong>19‏/7‏/2026، 9:16:57 م</strong></div>\n    </section>\n    <table>\n    <tr>\n      <td class="qty">1x</td>\n      <td>\n        <strong>مارغريتا</strong>\n        <small>وسط</small>\n        \n      </td>\n      <td class="money">₪ 9.00</td>\n    </tr>\n    <tr>\n      <td class="qty">1x</td>\n      <td>\n        <strong>سلطة حلوم</strong>\n        \n        \n      </td>\n      <td class="money">₪ 7.75</td>\n    </tr></table>\n    <section class="totals">\n      <div class="line "><span>المجموع</span><strong>₪ 16.75</strong></div>\n      \n      \n      <div class="line strong"><span>الإجمالي</span><strong>₪ 16.75</strong></div>\n      <div class="line "><span>الدفع</span><strong>نقداً ILS 16.75</strong></div>\n    </section>\n    <footer>شكراً لزيارتكم</footer></body></html>	1	W80	\N	FAILED	5	5	WINDOWS_PRINT_ERROR	Invalid printer settings	invoice:cmrs4azpn0001cg9na8o6awqq:receipt:reprint:1784485125380	2026-07-19 18:18:45.387	2026-07-19 18:18:45.607	2026-07-19 18:23:11.997	\N	2026-07-19 18:23:12.645	\N	f	\N	\N	f
cmrs4j1ca0006gk9nzcsoxf1k	cmr97q88n0000rs9nh4sethxg	cmrs0kvf90002t89nnfc21r9f	cmrs4db040007cg9nzhr3t2fc	cmrs4j1at0001gk9ndsggw6an	\N	\N	CUSTOMER_RECEIPT	HTML	<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>\n    @page{margin:0;size:80mm auto}*{box-sizing:border-box}html,body{width:80mm;margin:0;padding:0;background:#fff;color:#000;font-family:Arial,Tahoma,sans-serif}\n    body{padding:4mm;font-size:11px;line-height:1.35}.ticket body{font-size:13px}h1{font-size:17px;margin:0 0 2mm;text-align:center}p{margin:0}header{text-align:center}\n    .meta,.totals{border-top:1px dashed #000;border-bottom:1px dashed #000;margin:3mm 0;padding:2mm 0}.line{display:flex;justify-content:space-between;gap:3mm}.line strong{font-size:14px}\n    table{width:100%;border-collapse:collapse}td{padding:1.5mm 0;vertical-align:top;border-bottom:1px dotted #999}.qty{width:9mm;font-weight:bold}.money{text-align:end;white-space:nowrap}small{display:block;color:#333;margin-top:1mm}footer{text-align:center;margin-top:4mm;font-weight:bold}\n  </style></head><body class="receipt">\n    <header>\n      <h1>شيخ الكار</h1>\n      <p>الفرع الرئيسي - Ramallah, Palestine</p>\n    </header>\n    <section class="meta">\n      <div class="line "><span>الفاتورة</span><strong>#MAIN-REG-MAIN-01-2026-000019</strong></div>\n      <div class="line "><span>الطلب</span><strong>-</strong></div>\n      <div class="line "><span>الكاشير</span><strong>Omar Khalil</strong></div>\n      <div class="line "><span>الوقت</span><strong>19‏/7‏/2026، 9:23:12 م</strong></div>\n    </section>\n    <table>\n    <tr>\n      <td class="qty">1x</td>\n      <td>\n        <strong>تيراميسو</strong>\n        \n        \n      </td>\n      <td class="money">₪ 5.00</td>\n    </tr>\n    <tr>\n      <td class="qty">1x</td>\n      <td>\n        <strong>بطاطا محملة</strong>\n        <small>صغير</small>\n        \n      </td>\n      <td class="money">₪ 4.50</td>\n    </tr></table>\n    <section class="totals">\n      <div class="line "><span>المجموع</span><strong>₪ 9.50</strong></div>\n      \n      \n      <div class="line strong"><span>الإجمالي</span><strong>₪ 9.50</strong></div>\n      <div class="line "><span>الدفع</span><strong>نقداً ILS 9.50</strong></div>\n    </section>\n    <footer>شكراً لزيارتكم</footer></body></html>	1	W80	\N	FAILED	5	5	WINDOWS_PRINT_ERROR	Invalid printer settings	invoice:cmrs4j1at0001gk9ndsggw6an:receipt:cmrs4db040007cg9nzhr3t2fc	2026-07-19 18:23:12.778	2026-07-19 18:23:17.695	2026-07-19 18:23:44.009	\N	2026-07-19 18:23:44.618	\N	f	\N	\N	f
cmrs4t82i0000fw9nbilf2grb	cmr97q88n0000rs9nh4sethxg	cmrs0kvf90002t89nnfc21r9f	cmrs4db040007cg9nzhr3t2fc	cmrs4j1at0001gk9ndsggw6an	\N	cmrs4j1ca0006gk9nzcsoxf1k	CUSTOMER_RECEIPT	HTML	<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>\n    @page{margin:0;size:80mm auto}*{box-sizing:border-box}html,body{width:80mm;margin:0;padding:0;background:#fff;color:#000;font-family:Arial,Tahoma,sans-serif}\n    body{padding:4mm;font-size:11px;line-height:1.35}.ticket body{font-size:13px}h1{font-size:17px;margin:0 0 2mm;text-align:center}p{margin:0}header{text-align:center}\n    .meta,.totals{border-top:1px dashed #000;border-bottom:1px dashed #000;margin:3mm 0;padding:2mm 0}.line{display:flex;justify-content:space-between;gap:3mm}.line strong{font-size:14px}\n    table{width:100%;border-collapse:collapse}td{padding:1.5mm 0;vertical-align:top;border-bottom:1px dotted #999}.qty{width:9mm;font-weight:bold}.money{text-align:end;white-space:nowrap}small{display:block;color:#333;margin-top:1mm}footer{text-align:center;margin-top:4mm;font-weight:bold}\n  </style></head><body class="receipt">\n    <header>\n      <h1>شيخ الكار</h1>\n      <p>الفرع الرئيسي - Ramallah, Palestine</p>\n    <p><strong>REPRINT / إعادة طباعة</strong></p></header>\n    <section class="meta">\n      <div class="line "><span>الفاتورة</span><strong>#MAIN-REG-MAIN-01-2026-000019</strong></div>\n      <div class="line "><span>الطلب</span><strong>-</strong></div>\n      <div class="line "><span>الكاشير</span><strong>Omar Khalil</strong></div>\n      <div class="line "><span>الوقت</span><strong>19‏/7‏/2026، 9:23:12 م</strong></div>\n    </section>\n    <table>\n    <tr>\n      <td class="qty">1x</td>\n      <td>\n        <strong>تيراميسو</strong>\n        \n        \n      </td>\n      <td class="money">₪ 5.00</td>\n    </tr>\n    <tr>\n      <td class="qty">1x</td>\n      <td>\n        <strong>بطاطا محملة</strong>\n        <small>صغير</small>\n        \n      </td>\n      <td class="money">₪ 4.50</td>\n    </tr></table>\n    <section class="totals">\n      <div class="line "><span>المجموع</span><strong>₪ 9.50</strong></div>\n      \n      \n      <div class="line strong"><span>الإجمالي</span><strong>₪ 9.50</strong></div>\n      <div class="line "><span>الدفع</span><strong>نقداً ILS 9.50</strong></div>\n    </section>\n    <footer>شكراً لزيارتكم</footer></body></html>	1	W80	\N	FAILED	5	5	WINDOWS_PRINT_ERROR	Invalid printer settings	invoice:cmrs4j1at0001gk9ndsggw6an:receipt:reprint:1784485868045	2026-07-19 18:31:08.058	2026-07-19 18:31:09.536	2026-07-19 18:31:38.921	\N	2026-07-19 18:31:39.489	\N	f	\N	\N	f
cmrs5f6tf0006uw9n0he9puto	cmr97q88n0000rs9nh4sethxg	cmrs0kvf90002t89nnfc21r9f	cmrs4db040007cg9nzhr3t2fc	cmrs5f6rn0001uw9n5yczkqh6	\N	\N	CUSTOMER_RECEIPT	HTML	<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>\n    @page{margin:0;size:80mm auto}*{box-sizing:border-box}html,body{width:80mm;margin:0;padding:0;background:#fff;color:#000;font-family:Arial,Tahoma,sans-serif}\n    body{padding:4mm;font-size:11px;line-height:1.35}.ticket body{font-size:13px}h1{font-size:17px;margin:0 0 2mm;text-align:center}p{margin:0}header{text-align:center}\n    .meta,.totals{border-top:1px dashed #000;border-bottom:1px dashed #000;margin:3mm 0;padding:2mm 0}.line{display:flex;justify-content:space-between;gap:3mm}.line strong{font-size:14px}\n    table{width:100%;border-collapse:collapse}td{padding:1.5mm 0;vertical-align:top;border-bottom:1px dotted #999}.qty{width:9mm;font-weight:bold}.money{text-align:end;white-space:nowrap}small{display:block;color:#333;margin-top:1mm}footer{text-align:center;margin-top:4mm;font-weight:bold}\n  </style></head><body class="receipt">\n    <header>\n      <h1>شيخ الكار</h1>\n      <p>الفرع الرئيسي - Ramallah, Palestine</p>\n    </header>\n    <section class="meta">\n      <div class="line "><span>الفاتورة</span><strong>#MAIN-REG-MAIN-01-2026-000020</strong></div>\n      <div class="line "><span>الطلب</span><strong>-</strong></div>\n      <div class="line "><span>الكاشير</span><strong>Omar Khalil</strong></div>\n      <div class="line "><span>الوقت</span><strong>19‏/7‏/2026، 9:48:12 م</strong></div>\n    </section>\n    <table>\n    <tr>\n      <td class="qty">1x</td>\n      <td>\n        <strong>تيراميسو</strong>\n        \n        \n      </td>\n      <td class="money">₪ 5.00</td>\n    </tr>\n    <tr>\n      <td class="qty">1x</td>\n      <td>\n        <strong>فستق مثلج</strong>\n        <small>عادي</small>\n        \n      </td>\n      <td class="money">₪ 4.25</td>\n    </tr></table>\n    <section class="totals">\n      <div class="line "><span>المجموع</span><strong>₪ 9.25</strong></div>\n      \n      \n      <div class="line strong"><span>الإجمالي</span><strong>₪ 9.25</strong></div>\n      <div class="line "><span>الدفع</span><strong>نقداً ILS 9.25</strong></div>\n    </section>\n    <footer>شكراً لزيارتكم</footer></body></html>	1	W80	\N	FAILED	5	5	WINDOWS_PRINT_ERROR	Invalid printer settings	invoice:cmrs5f6rn0001uw9n5yczkqh6:receipt:cmrs4db040007cg9nzhr3t2fc	2026-07-19 18:48:12.867	2026-07-19 18:48:12.922	2026-07-19 18:49:10.086	\N	2026-07-19 18:49:10.691	\N	f	\N	\N	f
cmrsablps0005wk9nws4igysj	cmr97q88n0000rs9nh4sethxg	cmrs0kvf90002t89nnfc21r9f	cmrs4db040007cg9nzhr3t2fc	cmrs8m6jt0001w89neogjma52	\N	cmrs8m6n9000aw89np74vlf3c	CUSTOMER_RECEIPT	HTML	<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>\n    :root{--receipt-width:60mm}@page{size:60mm auto;margin:0}*{box-sizing:border-box}\n    body.receipt-document{width:var(--receipt-width);margin:0;padding:0;background:#fff;color:#000;overflow:visible;font-family:Arial,Tahoma,"Segoe UI",sans-serif}\n    .receipt{width:var(--receipt-width);min-width:var(--receipt-width);max-width:var(--receipt-width);padding:4mm;box-sizing:border-box;font-family:Arial,Tahoma,"Segoe UI",sans-serif;font-size:11px;line-height:1.35;color:#000;background:#fff;overflow:visible;height:auto;max-height:none}\n    .receipt .logo{width:17mm;height:17mm;object-fit:contain;display:block;margin:0 auto 2mm}.receipt h1{font-size:17px;margin:0 0 1mm;text-align:center}.receipt p{margin:0 0 1mm}.receipt header,.receipt footer{text-align:center}\n    .receipt .center{text-align:center}.receipt .en{direction:ltr}.receipt .meta,.receipt .totals{border-top:1px dashed #000;border-bottom:1px dashed #000;margin:3mm 0;padding:2mm 0}\n    .receipt .row{display:flex;justify-content:space-between;align-items:flex-start;gap:3mm;margin:1mm 0}.receipt .row span:first-child{flex:0 0 auto}.receipt .value{overflow-wrap:anywhere;word-break:break-word;text-align:end;max-width:45mm}\n    .receipt .invoice-number{max-width:100%;overflow-wrap:anywhere;word-break:break-word;white-space:normal;direction:ltr;text-align:left}\n    .receipt table{width:100%;border-collapse:collapse}.receipt td{padding:1.5mm 0;vertical-align:top;border-bottom:1px dotted #999}.receipt .qty{width:9mm;font-weight:bold}.receipt .item-name{overflow-wrap:anywhere;word-break:break-word}.receipt .money{text-align:end;white-space:nowrap}\n    .receipt small{display:block;color:#333;margin-top:1mm}.receipt .strong{font-size:14px;font-weight:bold}.receipt footer{margin-top:4mm;font-size:10px}\n  </style></head><body class="receipt receipt-document">\n    <main class="receipt">\n      <header>\n        <img class="logo" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3QgeD0iNTQiIHk9IjQ2IiB3aWR0aD0iNDA0IiBoZWlnaHQ9IjQyMCIgcng9Ijg2IiBmaWxsPSIjRjg2ODAwIi8+PHBhdGggZD0iTTEzNSAxMjhoMjQyYzIyIDAgNDAgMTggNDAgNDB2MTI4YzAgMzEtMjUgNTYtNTYgNTZoLTRjLTI3IDAtNDktMjItNDktNDl2LTg3SDIwNHY4N2MwIDI3LTIyIDQ5LTQ5IDQ5aC00Yy0zMSAwLTU2LTI1LTU2LTU2VjE2OGMwLTIyIDE4LTQwIDQwLTQwWiIgZmlsbD0iI0ZGRkZGRiIvPjxwYXRoIGQ9Ik0yMDkgMTc0aDExOGwtMjEgODZjLTUgMjEgMiA0MyAxOCA1OGwxMyAxMkgyMTBjMjgtMzAgNDEtNjUgMzktMTA1bC00MC01MVoiIGZpbGw9IiNGODY4MDAiLz48cGF0aCBkPSJNMjAzIDE2OGgxMzhsLTEyIDQ2SDIxNmwtMTMtNDZaIiBmaWxsPSIjRkY4QTFGIi8+PHBhdGggZD0iTTIyMiAyMjNoNTJjMyAyNSAwIDUzLTkgODMiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIxMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTI5NCAyMjRjNiAzMyA2IDY3IDAgMTAxTTMyMCAyMjRjNSAzNCA1IDY4IDAgMTAxTTM0NSAyMjRjNCAzMiA0IDY1IDAgOTgiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIxMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTIwOSAzNTdjLTggMjQtMjAgNDMtMzkgNTdoMTUzYy0xNS0xMy0yNC0zMS0yNi01N0gyMDlaIiBmaWxsPSIjRkZGRkZGIi8+PC9zdmc+" alt="Sheikh Al Kar logo">\n        <h1>شيخ الكار</h1>\n        <p class="en center">Sheikh Al Kar</p>\n        <p>الفرع الرئيسي</p>\n        <p>Ramallah, Palestine</p>\n        \n        <p>الرقم الضريبي: <span dir="ltr">310048229</span></p>\n        <p><strong>REPRINT / إعادة طباعة</strong></p>\n      </header>\n      <section class="meta">\n        <div class="row"><span>الفاتورة</span><strong class="value invoice-number">#MAIN-REG-MAIN-01-2026-000025</strong></div>\n        <div class="row"><span>التاريخ</span><strong class="value ">19‏/7‏/2026</strong></div>\n        <div class="row"><span>الوقت</span><strong class="value ">11:17 م</strong></div>\n        <div class="row"><span>الموظف</span><strong class="value ">Omar Khalil</strong></div>\n        <div class="row"><span>الزبون</span><strong class="value ">test</strong></div>\n        <div class="row"><span>هاتف الزبون</span><strong class="value ">0598746584</strong></div>\n        <div class="row"><span>طريقة الدفع</span><strong class="value ">نقداً</strong></div>\n        <div class="row"><span>العملة</span><strong class="value ">ILS</strong></div>\n        <div class="row"><span>المدفوع</span><strong class="value ">ILS 36.90</strong></div>\n        <div class="row"><span>طريقة التسليم</span><strong class="value ">توصيل</strong></div>\n        <div class="row"><span>نوع الطلب</span><strong class="value ">توصيل</strong></div>\n        <div class="row"><span>ملاحظات</span><strong class="value ">test</strong></div>\n      </section>\n      <table><tbody>\n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>تيراميسو</strong>\n        \n        \n        \n        \n        <small>سعر الوحدة: ILS 5.00</small>\n      </td>\n      <td class="money">ILS 5.00</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>مارغريتا</strong>\n        \n        <small>وسط</small>\n        \n        \n        <small>سعر الوحدة: ILS 9.00</small>\n      </td>\n      <td class="money">ILS 9.00</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>بيبروني حار</strong>\n        \n        <small>وسط</small>\n        \n        \n        <small>سعر الوحدة: ILS 10.50</small>\n      </td>\n      <td class="money">ILS 10.50</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>سلطة حلوم</strong>\n        \n        \n        \n        \n        <small>سعر الوحدة: ILS 7.75</small>\n      </td>\n      <td class="money">ILS 7.75</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>فستق مثلج</strong>\n        \n        <small>عادي</small>\n        \n        \n        <small>سعر الوحدة: ILS 4.25</small>\n      </td>\n      <td class="money">ILS 4.25</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>بطاطا محملة</strong>\n        \n        <small>صغير</small>\n        \n        \n        <small>سعر الوحدة: ILS 4.50</small>\n      </td>\n      <td class="money">ILS 4.50</td>\n    </tr>\n  </tbody></table>\n      <section class="totals">\n        <div class="row "><span>المجموع</span><strong class="value">ILS 41.00</strong></div>\n        <div class="row "><span>الخصم</span><strong class="value">- ILS 4.10</strong></div>\n        \n        \n        \n        <div class="row strong"><span>الإجمالي</span><strong class="value">ILS 36.90</strong></div>\n        <div class="row "><span>المدفوع</span><strong class="value">ILS 36.90</strong></div>\n        \n      </section>\n      <footer>\n        <strong>شكراً لزيارتكم</strong>\n        <p>الأسعار تشمل الضريبة</p>\n        <p>الرقم الضريبي: <span dir="ltr">310048229</span></p>\n        <p class="invoice-number">cmrs8m6jt0001w89neogjma52</p>\n      </footer>\n    </main></body></html>	1	W80	\N	PRINTED	1	5	\N	\N	invoice:cmrs8m6jt0001w89neogjma52:receipt:reprint:1784495123630	2026-07-19 21:05:23.632	2026-07-19 21:06:05.253	2026-07-19 21:06:07.056	2026-07-19 21:06:08.334	\N	\N	f	\N	\N	f
cmvi38q7a000c909nmdelr0db	cmr97q88n0000rs9nh4sethxg	cmrs0kvf90002t89nnfc21r9f	cmrs4db040007cg9nzhr3t2fc	cmvi38q3q0001909njamdiw1q	\N	\N	CUSTOMER_RECEIPT	HTML	<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>\n    :root{--receipt-width:60mm}@page{size:60mm auto;margin:0}*{box-sizing:border-box}\n    body.receipt-document{width:var(--receipt-width);margin:0;padding:0;background:#fff;color:#000;overflow:visible;font-family:Arial,Tahoma,"Segoe UI",sans-serif}\n    .receipt{width:var(--receipt-width);min-width:var(--receipt-width);max-width:var(--receipt-width);padding:4mm;box-sizing:border-box;font-family:Arial,Tahoma,"Segoe UI",sans-serif;font-size:11px;line-height:1.35;color:#000;background:#fff;overflow:visible;height:auto;max-height:none}\n    .receipt .logo{width:17mm;height:17mm;object-fit:contain;display:block;margin:0 auto 2mm}.receipt h1{font-size:17px;margin:0 0 1mm;text-align:center}.receipt p{margin:0 0 1mm}.receipt header,.receipt footer{text-align:center}\n    .receipt .center{text-align:center}.receipt .en{direction:ltr}.receipt .meta,.receipt .totals{border-top:1px dashed #000;border-bottom:1px dashed #000;margin:3mm 0;padding:2mm 0}\n    .receipt .row{display:flex;justify-content:space-between;align-items:flex-start;gap:3mm;margin:1mm 0}.receipt .row span:first-child{flex:0 0 auto}.receipt .value{overflow-wrap:anywhere;word-break:break-word;text-align:end;max-width:45mm}\n    .receipt .invoice-number{max-width:100%;overflow-wrap:anywhere;word-break:break-word;white-space:normal;direction:ltr;text-align:left}\n    .receipt table{width:100%;border-collapse:collapse}.receipt td{padding:1.5mm 0;vertical-align:top;border-bottom:1px dotted #999}.receipt .qty{width:9mm;font-weight:bold}.receipt .item-name{overflow-wrap:anywhere;word-break:break-word}.receipt .money{text-align:end;white-space:nowrap}\n    .receipt small{display:block;color:#333;margin-top:1mm}.receipt .strong{font-size:14px;font-weight:bold}.receipt footer{margin-top:4mm;font-size:10px}\n  </style></head><body class="receipt receipt-document">\n    <main class="receipt">\n      <header>\n        <img class="logo" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3QgeD0iNTQiIHk9IjQ2IiB3aWR0aD0iNDA0IiBoZWlnaHQ9IjQyMCIgcng9Ijg2IiBmaWxsPSIjRjg2ODAwIi8+PHBhdGggZD0iTTEzNSAxMjhoMjQyYzIyIDAgNDAgMTggNDAgNDB2MTI4YzAgMzEtMjUgNTYtNTYgNTZoLTRjLTI3IDAtNDktMjItNDktNDl2LTg3SDIwNHY4N2MwIDI3LTIyIDQ5LTQ5IDQ5aC00Yy0zMSAwLTU2LTI1LTU2LTU2VjE2OGMwLTIyIDE4LTQwIDQwLTQwWiIgZmlsbD0iI0ZGRkZGRiIvPjxwYXRoIGQ9Ik0yMDkgMTc0aDExOGwtMjEgODZjLTUgMjEgMiA0MyAxOCA1OGwxMyAxMkgyMTBjMjgtMzAgNDEtNjUgMzktMTA1bC00MC01MVoiIGZpbGw9IiNGODY4MDAiLz48cGF0aCBkPSJNMjAzIDE2OGgxMzhsLTEyIDQ2SDIxNmwtMTMtNDZaIiBmaWxsPSIjRkY4QTFGIi8+PHBhdGggZD0iTTIyMiAyMjNoNTJjMyAyNSAwIDUzLTkgODMiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIxMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTI5NCAyMjRjNiAzMyA2IDY3IDAgMTAxTTMyMCAyMjRjNSAzNCA1IDY4IDAgMTAxTTM0NSAyMjRjNCAzMiA0IDY1IDAgOTgiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIxMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTIwOSAzNTdjLTggMjQtMjAgNDMtMzkgNTdoMTUzYy0xNS0xMy0yNC0zMS0yNi01N0gyMDlaIiBmaWxsPSIjRkZGRkZGIi8+PC9zdmc+" alt="Sheikh Al Kar logo">\n        <h1>شيخ الكار</h1>\n        <p class="en center">Sheikh Al Kar</p>\n        <p>الفرع الرئيسي</p>\n        <p>Ramallah, Palestine</p>\n        \n        <p>الرقم الضريبي: <span dir="ltr">310048229</span></p>\n        \n      </header>\n      <section class="meta">\n        <div class="row"><span>الفاتورة</span><strong class="value invoice-number">#MAIN-REG-MAIN-01-2026-000027</strong></div>\n        <div class="row"><span>التاريخ</span><strong class="value ">21‏/10‏/2026</strong></div>\n        <div class="row"><span>الوقت</span><strong class="value ">03:28 م</strong></div>\n        <div class="row"><span>الموظف</span><strong class="value ">Omar Khalil</strong></div>\n        \n        \n        <div class="row"><span>طريقة الدفع</span><strong class="value ">نقداً</strong></div>\n        <div class="row"><span>العملة</span><strong class="value ">ILS</strong></div>\n        <div class="row"><span>المدفوع</span><strong class="value ">ILS 24.25</strong></div>\n        <div class="row"><span>طريقة التسليم</span><strong class="value ">سفري</strong></div>\n        <div class="row"><span>نوع الطلب</span><strong class="value ">سفري</strong></div>\n        \n      </section>\n      <table><tbody>\n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>برغر الترفل</strong>\n        <small class="en">Truffle Smash</small>\n        <small>عادي</small>\n        <small>جبنة إضافية (ILS 1.00), بدون بصل</small>\n        \n        <small>سعر الوحدة: ILS 9.50</small>\n      </td>\n      <td class="money">ILS 9.50</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>فستق �ثلج</strong>\n        <small class="en">Iced Pistachio</small>\n        <small>عادي</small>\n        <small>شوت إضافي (ILS 1.00)</small>\n        \n        <small>سعر الوحدة: ILS 5.25</small>\n      </td>\n      <td class="money">ILS 5.25</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>برغر الترفل</strong>\n        <small class="en">Truffle Smash</small>\n        <small>عادي</small>\n        <small>جبنة إضافية (ILS 1.00)</small>\n        \n        <small>سعر الوحدة: ILS 9.50</small>\n      </td>\n      <td class="money">ILS 9.50</td>\n    </tr>\n  </tbody></table>\n      <section class="totals">\n        <div class="row "><span>المجموع</span><strong class="value">ILS 24.25</strong></div>\n        \n        \n        \n        \n        <div class="row strong"><span>الإجمالي</span><strong class="value">ILS 24.25</strong></div>\n        <div class="row "><span>المدفوع</span><strong class="value">ILS 24.25</strong></div>\n        \n      </section>\n      <footer>\n        <strong>شكراً لزيارتكم</strong>\n        <p>الأسعار تشمل الضريبة</p>\n        <p>الرقم الضريبي: <span dir="ltr">310048229</span></p>\n        <p class="invoice-number">cmvi38q3q0001909njamdiw1q</p>\n      </footer>\n    </main></body></html>	1	W80	\N	PENDING	0	5	\N	\N	invoice:cmvi38q3q0001909njamdiw1q:receipt:cmrs4db040007cg9nzhr3t2fc	2026-10-21 12:28:19.75	\N	\N	\N	\N	\N	f	\N	\N	f
cmrs6mlku0006dg9n9fg8ezfk	cmr97q88n0000rs9nh4sethxg	cmrs0kvf90002t89nnfc21r9f	cmrs4db040007cg9nzhr3t2fc	cmrs6mlhe0001dg9n8x68yq83	\N	\N	CUSTOMER_RECEIPT	HTML	<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>\n    @page{margin:0;size:80mm auto}*{box-sizing:border-box}html,body{width:80mm;margin:0;padding:0;background:#fff;color:#000;font-family:Arial,Tahoma,sans-serif}\n    body{padding:4mm;font-size:11px;line-height:1.35}.ticket body{font-size:13px}h1{font-size:17px;margin:0 0 2mm;text-align:center}p{margin:0}header{text-align:center}\n    .meta,.totals{border-top:1px dashed #000;border-bottom:1px dashed #000;margin:3mm 0;padding:2mm 0}.line{display:flex;justify-content:space-between;gap:3mm}.line strong{font-size:14px}\n    table{width:100%;border-collapse:collapse}td{padding:1.5mm 0;vertical-align:top;border-bottom:1px dotted #999}.qty{width:9mm;font-weight:bold}.money{text-align:end;white-space:nowrap}small{display:block;color:#333;margin-top:1mm}footer{text-align:center;margin-top:4mm;font-weight:bold}\n  </style></head><body class="receipt">\n    <header>\n      <h1>شيخ الكار</h1>\n      <p>الفرع الرئيسي - Ramallah, Palestine</p>\n    </header>\n    <section class="meta">\n      <div class="line "><span>الفاتورة</span><strong>#MAIN-REG-MAIN-01-2026-000022</strong></div>\n      <div class="line "><span>الطلب</span><strong>-</strong></div>\n      <div class="line "><span>الكاشير</span><strong>Omar Khalil</strong></div>\n      <div class="line "><span>الوقت</span><strong>19‏/7‏/2026، 10:21:58 م</strong></div>\n    </section>\n    <table>\n    <tr>\n      <td class="qty">1x</td>\n      <td>\n        <strong>فستق مثلج</strong>\n        <small>عادي</small>\n        \n      </td>\n      <td class="money">₪ 4.25</td>\n    </tr>\n    <tr>\n      <td class="qty">1x</td>\n      <td>\n        <strong>تيراميسو</strong>\n        \n        \n      </td>\n      <td class="money">₪ 5.00</td>\n    </tr></table>\n    <section class="totals">\n      <div class="line "><span>المجموع</span><strong>₪ 9.25</strong></div>\n      \n      \n      <div class="line strong"><span>الإجمالي</span><strong>₪ 9.25</strong></div>\n      <div class="line "><span>الدفع</span><strong>نقداً ILS 9.25</strong></div>\n    </section>\n    <footer>شكراً لزيارتكم</footer></body></html>	1	W80	\N	FAILED	5	5	WINDOWS_PRINT_ERROR	Invalid printer settings	invoice:cmrs6mlhe0001dg9n8x68yq83:receipt:cmrs4db040007cg9nzhr3t2fc	2026-07-19 19:21:58.206	2026-07-19 19:21:58.27	2026-07-19 19:25:38.602	\N	2026-07-19 19:25:39.25	\N	f	\N	\N	f
cmrs5fie20008uw9nerv7fmrb	cmr97q88n0000rs9nh4sethxg	cmrs0kvf90002t89nnfc21r9f	cmrs4db040007cg9nzhr3t2fc	cmrs5f6rn0001uw9n5yczkqh6	\N	cmrs5f6tf0006uw9n0he9puto	CUSTOMER_RECEIPT	HTML	<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>\n    @page{margin:0;size:80mm auto}*{box-sizing:border-box}html,body{width:80mm;margin:0;padding:0;background:#fff;color:#000;font-family:Arial,Tahoma,sans-serif}\n    body{padding:4mm;font-size:11px;line-height:1.35}.ticket body{font-size:13px}h1{font-size:17px;margin:0 0 2mm;text-align:center}p{margin:0}header{text-align:center}\n    .meta,.totals{border-top:1px dashed #000;border-bottom:1px dashed #000;margin:3mm 0;padding:2mm 0}.line{display:flex;justify-content:space-between;gap:3mm}.line strong{font-size:14px}\n    table{width:100%;border-collapse:collapse}td{padding:1.5mm 0;vertical-align:top;border-bottom:1px dotted #999}.qty{width:9mm;font-weight:bold}.money{text-align:end;white-space:nowrap}small{display:block;color:#333;margin-top:1mm}footer{text-align:center;margin-top:4mm;font-weight:bold}\n  </style></head><body class="receipt">\n    <header>\n      <h1>شيخ الكار</h1>\n      <p>الفرع الرئيسي - Ramallah, Palestine</p>\n    <p><strong>REPRINT / إعادة طباعة</strong></p></header>\n    <section class="meta">\n      <div class="line "><span>الفاتورة</span><strong>#MAIN-REG-MAIN-01-2026-000020</strong></div>\n      <div class="line "><span>الطلب</span><strong>-</strong></div>\n      <div class="line "><span>الكاشير</span><strong>Omar Khalil</strong></div>\n      <div class="line "><span>الوقت</span><strong>19‏/7‏/2026، 9:48:12 م</strong></div>\n    </section>\n    <table>\n    <tr>\n      <td class="qty">1x</td>\n      <td>\n        <strong>تيراميسو</strong>\n        \n        \n      </td>\n      <td class="money">₪ 5.00</td>\n    </tr>\n    <tr>\n      <td class="qty">1x</td>\n      <td>\n        <strong>فستق مثلج</strong>\n        <small>عادي</small>\n        \n      </td>\n      <td class="money">₪ 4.25</td>\n    </tr></table>\n    <section class="totals">\n      <div class="line "><span>المجموع</span><strong>₪ 9.25</strong></div>\n      \n      \n      <div class="line strong"><span>الإجمالي</span><strong>₪ 9.25</strong></div>\n      <div class="line "><span>الدفع</span><strong>نقداً ILS 9.25</strong></div>\n    </section>\n    <footer>شكراً لزيارتكم</footer></body></html>	1	W80	\N	FAILED	5	5	WINDOWS_PRINT_ERROR	Invalid printer settings	invoice:cmrs5f6rn0001uw9n5yczkqh6:receipt:reprint:1784486907863	2026-07-19 18:48:27.866	2026-07-19 18:48:27.9	2026-07-19 18:49:29.767	\N	2026-07-19 18:49:30.357	\N	f	\N	\N	f
cmrs6vtca000adg9nn8sdhczx	cmr97q88n0000rs9nh4sethxg	cmrs0kvf90002t89nnfc21r9f	cmrs4db040007cg9nzhr3t2fc	cmrs6mlhe0001dg9n8x68yq83	\N	cmrs6mlku0006dg9n9fg8ezfk	CUSTOMER_RECEIPT	HTML	<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>\n    @page{margin:0;size:80mm auto}*{box-sizing:border-box}html,body{width:80mm;margin:0;padding:0;background:#fff;color:#000;font-family:Arial,Tahoma,sans-serif}\n    body{padding:4mm;font-size:11px;line-height:1.35}.ticket body{font-size:13px}h1{font-size:17px;margin:0 0 2mm;text-align:center}p{margin:0}header{text-align:center}\n    .meta,.totals{border-top:1px dashed #000;border-bottom:1px dashed #000;margin:3mm 0;padding:2mm 0}.line{display:flex;justify-content:space-between;gap:3mm}.line strong{font-size:14px}\n    table{width:100%;border-collapse:collapse}td{padding:1.5mm 0;vertical-align:top;border-bottom:1px dotted #999}.qty{width:9mm;font-weight:bold}.money{text-align:end;white-space:nowrap}small{display:block;color:#333;margin-top:1mm}footer{text-align:center;margin-top:4mm;font-weight:bold}\n  </style></head><body class="receipt">\n    <header>\n      <h1>شيخ الكار</h1>\n      <p>الفرع الرئيسي - Ramallah, Palestine</p>\n    <p><strong>REPRINT / إعادة طباعة</strong></p></header>\n    <section class="meta">\n      <div class="line "><span>الفاتورة</span><strong>#MAIN-REG-MAIN-01-2026-000022</strong></div>\n      <div class="line "><span>الطلب</span><strong>-</strong></div>\n      <div class="line "><span>الكاشير</span><strong>Omar Khalil</strong></div>\n      <div class="line "><span>الوقت</span><strong>19‏/7‏/2026، 10:21:58 م</strong></div>\n    </section>\n    <table>\n    <tr>\n      <td class="qty">1x</td>\n      <td>\n        <strong>فستق مثلج</strong>\n        <small>عادي</small>\n        \n      </td>\n      <td class="money">₪ 4.25</td>\n    </tr>\n    <tr>\n      <td class="qty">1x</td>\n      <td>\n        <strong>تيراميسو</strong>\n        \n        \n      </td>\n      <td class="money">₪ 5.00</td>\n    </tr></table>\n    <section class="totals">\n      <div class="line "><span>المجموع</span><strong>₪ 9.25</strong></div>\n      \n      \n      <div class="line strong"><span>الإجمالي</span><strong>₪ 9.25</strong></div>\n      <div class="line "><span>الدفع</span><strong>نقداً ILS 9.25</strong></div>\n    </section>\n    <footer>شكراً لزيارتكم</footer></body></html>	1	W80	\N	FAILED	5	5	WINDOWS_PRINT_ERROR	Invalid printer settings	invoice:cmrs6mlhe0001dg9n8x68yq83:receipt:reprint:1784489348167	2026-07-19 19:29:08.17	2026-07-19 19:29:08.216	2026-07-19 19:35:06.047	\N	2026-07-19 19:35:06.742	\N	f	\N	\N	f
cmrs6vx5k000bdg9nz4f2bj6z	cmr97q88n0000rs9nh4sethxg	cmrs0kvf90002t89nnfc21r9f	cmrs4db040007cg9nzhr3t2fc	cmrs6mlhe0001dg9n8x68yq83	\N	cmrs6mlku0006dg9n9fg8ezfk	CUSTOMER_RECEIPT	HTML	<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>\n    @page{margin:0;size:80mm auto}*{box-sizing:border-box}html,body{width:80mm;margin:0;padding:0;background:#fff;color:#000;font-family:Arial,Tahoma,sans-serif}\n    body{padding:4mm;font-size:11px;line-height:1.35}.ticket body{font-size:13px}h1{font-size:17px;margin:0 0 2mm;text-align:center}p{margin:0}header{text-align:center}\n    .meta,.totals{border-top:1px dashed #000;border-bottom:1px dashed #000;margin:3mm 0;padding:2mm 0}.line{display:flex;justify-content:space-between;gap:3mm}.line strong{font-size:14px}\n    table{width:100%;border-collapse:collapse}td{padding:1.5mm 0;vertical-align:top;border-bottom:1px dotted #999}.qty{width:9mm;font-weight:bold}.money{text-align:end;white-space:nowrap}small{display:block;color:#333;margin-top:1mm}footer{text-align:center;margin-top:4mm;font-weight:bold}\n  </style></head><body class="receipt">\n    <header>\n      <h1>شيخ الكار</h1>\n      <p>الفرع الرئيسي - Ramallah, Palestine</p>\n    <p><strong>REPRINT / إعادة طباعة</strong></p></header>\n    <section class="meta">\n      <div class="line "><span>الفاتورة</span><strong>#MAIN-REG-MAIN-01-2026-000022</strong></div>\n      <div class="line "><span>الطلب</span><strong>-</strong></div>\n      <div class="line "><span>الكاشير</span><strong>Omar Khalil</strong></div>\n      <div class="line "><span>الوقت</span><strong>19‏/7‏/2026، 10:21:58 م</strong></div>\n    </section>\n    <table>\n    <tr>\n      <td class="qty">1x</td>\n      <td>\n        <strong>فستق مثلج</strong>\n        <small>عادي</small>\n        \n      </td>\n      <td class="money">₪ 4.25</td>\n    </tr>\n    <tr>\n      <td class="qty">1x</td>\n      <td>\n        <strong>تيراميسو</strong>\n        \n        \n      </td>\n      <td class="money">₪ 5.00</td>\n    </tr></table>\n    <section class="totals">\n      <div class="line "><span>المجموع</span><strong>₪ 9.25</strong></div>\n      \n      \n      <div class="line strong"><span>الإجمالي</span><strong>₪ 9.25</strong></div>\n      <div class="line "><span>الدفع</span><strong>نقداً ILS 9.25</strong></div>\n    </section>\n    <footer>شكراً لزيارتكم</footer></body></html>	1	W80	\N	FAILED	5	5	WINDOWS_PRINT_ERROR	Invalid printer settings	invoice:cmrs6mlhe0001dg9n8x68yq83:receipt:reprint:1784489353110	2026-07-19 19:29:13.112	2026-07-19 19:29:13.159	2026-07-19 19:35:34.751	\N	2026-07-19 19:35:35.326	\N	f	\N	\N	f
cmrs5fouz0009uw9nz3aakqku	cmr97q88n0000rs9nh4sethxg	cmrs0kvf90002t89nnfc21r9f	cmrs4db040007cg9nzhr3t2fc	cmrs5f6rn0001uw9n5yczkqh6	\N	cmrs5f6tf0006uw9n0he9puto	CUSTOMER_RECEIPT	HTML	<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>\n    @page{margin:0;size:80mm auto}*{box-sizing:border-box}html,body{width:80mm;margin:0;padding:0;background:#fff;color:#000;font-family:Arial,Tahoma,sans-serif}\n    body{padding:4mm;font-size:11px;line-height:1.35}.ticket body{font-size:13px}h1{font-size:17px;margin:0 0 2mm;text-align:center}p{margin:0}header{text-align:center}\n    .meta,.totals{border-top:1px dashed #000;border-bottom:1px dashed #000;margin:3mm 0;padding:2mm 0}.line{display:flex;justify-content:space-between;gap:3mm}.line strong{font-size:14px}\n    table{width:100%;border-collapse:collapse}td{padding:1.5mm 0;vertical-align:top;border-bottom:1px dotted #999}.qty{width:9mm;font-weight:bold}.money{text-align:end;white-space:nowrap}small{display:block;color:#333;margin-top:1mm}footer{text-align:center;margin-top:4mm;font-weight:bold}\n  </style></head><body class="receipt">\n    <header>\n      <h1>شيخ الكار</h1>\n      <p>الفرع الرئيسي - Ramallah, Palestine</p>\n    <p><strong>REPRINT / إعادة طباعة</strong></p></header>\n    <section class="meta">\n      <div class="line "><span>الفاتورة</span><strong>#MAIN-REG-MAIN-01-2026-000020</strong></div>\n      <div class="line "><span>الطلب</span><strong>-</strong></div>\n      <div class="line "><span>الكاشير</span><strong>Omar Khalil</strong></div>\n      <div class="line "><span>الوقت</span><strong>19‏/7‏/2026، 9:48:12 م</strong></div>\n    </section>\n    <table>\n    <tr>\n      <td class="qty">1x</td>\n      <td>\n        <strong>تيراميسو</strong>\n        \n        \n      </td>\n      <td class="money">₪ 5.00</td>\n    </tr>\n    <tr>\n      <td class="qty">1x</td>\n      <td>\n        <strong>فستق مثلج</strong>\n        <small>عادي</small>\n        \n      </td>\n      <td class="money">₪ 4.25</td>\n    </tr></table>\n    <section class="totals">\n      <div class="line "><span>المجموع</span><strong>₪ 9.25</strong></div>\n      \n      \n      <div class="line strong"><span>الإجمالي</span><strong>₪ 9.25</strong></div>\n      <div class="line "><span>الدفع</span><strong>نقداً ILS 9.25</strong></div>\n    </section>\n    <footer>شكراً لزيارتكم</footer></body></html>	1	W80	\N	FAILED	5	5	WINDOWS_PRINT_ERROR	Invalid printer settings	invoice:cmrs5f6rn0001uw9n5yczkqh6:receipt:reprint:1784486916249	2026-07-19 18:48:36.251	2026-07-19 18:48:36.304	2026-07-19 18:49:37.264	\N	2026-07-19 18:49:37.862	\N	f	\N	\N	f
cmrsac57c0006wk9n8v2z10yo	cmr97q88n0000rs9nh4sethxg	cmrs0kvf90002t89nnfc21r9f	cmrs4db040007cg9nzhr3t2fc	cmrs8m6jt0001w89neogjma52	\N	cmrs8m6n9000aw89np74vlf3c	CUSTOMER_RECEIPT	HTML	<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>\n    :root{--receipt-width:60mm}@page{size:60mm auto;margin:0}*{box-sizing:border-box}\n    body.receipt-document{width:var(--receipt-width);margin:0;padding:0;background:#fff;color:#000;overflow:visible;font-family:Arial,Tahoma,"Segoe UI",sans-serif}\n    .receipt{width:var(--receipt-width);min-width:var(--receipt-width);max-width:var(--receipt-width);padding:4mm;box-sizing:border-box;font-family:Arial,Tahoma,"Segoe UI",sans-serif;font-size:11px;line-height:1.35;color:#000;background:#fff;overflow:visible;height:auto;max-height:none}\n    .receipt .logo{width:17mm;height:17mm;object-fit:contain;display:block;margin:0 auto 2mm}.receipt h1{font-size:17px;margin:0 0 1mm;text-align:center}.receipt p{margin:0 0 1mm}.receipt header,.receipt footer{text-align:center}\n    .receipt .center{text-align:center}.receipt .en{direction:ltr}.receipt .meta,.receipt .totals{border-top:1px dashed #000;border-bottom:1px dashed #000;margin:3mm 0;padding:2mm 0}\n    .receipt .row{display:flex;justify-content:space-between;align-items:flex-start;gap:3mm;margin:1mm 0}.receipt .row span:first-child{flex:0 0 auto}.receipt .value{overflow-wrap:anywhere;word-break:break-word;text-align:end;max-width:45mm}\n    .receipt .invoice-number{max-width:100%;overflow-wrap:anywhere;word-break:break-word;white-space:normal;direction:ltr;text-align:left}\n    .receipt table{width:100%;border-collapse:collapse}.receipt td{padding:1.5mm 0;vertical-align:top;border-bottom:1px dotted #999}.receipt .qty{width:9mm;font-weight:bold}.receipt .item-name{overflow-wrap:anywhere;word-break:break-word}.receipt .money{text-align:end;white-space:nowrap}\n    .receipt small{display:block;color:#333;margin-top:1mm}.receipt .strong{font-size:14px;font-weight:bold}.receipt footer{margin-top:4mm;font-size:10px}\n  </style></head><body class="receipt receipt-document">\n    <main class="receipt">\n      <header>\n        <img class="logo" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3QgeD0iNTQiIHk9IjQ2IiB3aWR0aD0iNDA0IiBoZWlnaHQ9IjQyMCIgcng9Ijg2IiBmaWxsPSIjRjg2ODAwIi8+PHBhdGggZD0iTTEzNSAxMjhoMjQyYzIyIDAgNDAgMTggNDAgNDB2MTI4YzAgMzEtMjUgNTYtNTYgNTZoLTRjLTI3IDAtNDktMjItNDktNDl2LTg3SDIwNHY4N2MwIDI3LTIyIDQ5LTQ5IDQ5aC00Yy0zMSAwLTU2LTI1LTU2LTU2VjE2OGMwLTIyIDE4LTQwIDQwLTQwWiIgZmlsbD0iI0ZGRkZGRiIvPjxwYXRoIGQ9Ik0yMDkgMTc0aDExOGwtMjEgODZjLTUgMjEgMiA0MyAxOCA1OGwxMyAxMkgyMTBjMjgtMzAgNDEtNjUgMzktMTA1bC00MC01MVoiIGZpbGw9IiNGODY4MDAiLz48cGF0aCBkPSJNMjAzIDE2OGgxMzhsLTEyIDQ2SDIxNmwtMTMtNDZaIiBmaWxsPSIjRkY4QTFGIi8+PHBhdGggZD0iTTIyMiAyMjNoNTJjMyAyNSAwIDUzLTkgODMiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIxMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTI5NCAyMjRjNiAzMyA2IDY3IDAgMTAxTTMyMCAyMjRjNSAzNCA1IDY4IDAgMTAxTTM0NSAyMjRjNCAzMiA0IDY1IDAgOTgiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIxMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTIwOSAzNTdjLTggMjQtMjAgNDMtMzkgNTdoMTUzYy0xNS0xMy0yNC0zMS0yNi01N0gyMDlaIiBmaWxsPSIjRkZGRkZGIi8+PC9zdmc+" alt="Sheikh Al Kar logo">\n        <h1>شيخ الكار</h1>\n        <p class="en center">Sheikh Al Kar</p>\n        <p>الفرع الرئيسي</p>\n        <p>Ramallah, Palestine</p>\n        \n        <p>الرقم الضريبي: <span dir="ltr">310048229</span></p>\n        <p><strong>REPRINT / إعادة طباعة</strong></p>\n      </header>\n      <section class="meta">\n        <div class="row"><span>الفاتورة</span><strong class="value invoice-number">#MAIN-REG-MAIN-01-2026-000025</strong></div>\n        <div class="row"><span>التاريخ</span><strong class="value ">19‏/7‏/2026</strong></div>\n        <div class="row"><span>الوقت</span><strong class="value ">11:17 م</strong></div>\n        <div class="row"><span>الموظف</span><strong class="value ">Omar Khalil</strong></div>\n        <div class="row"><span>الزبون</span><strong class="value ">test</strong></div>\n        <div class="row"><span>هاتف الزبون</span><strong class="value ">0598746584</strong></div>\n        <div class="row"><span>طريقة الدفع</span><strong class="value ">نقداً</strong></div>\n        <div class="row"><span>العملة</span><strong class="value ">ILS</strong></div>\n        <div class="row"><span>المدفوع</span><strong class="value ">ILS 36.90</strong></div>\n        <div class="row"><span>طريقة التسليم</span><strong class="value ">توصيل</strong></div>\n        <div class="row"><span>نوع الطلب</span><strong class="value ">توصيل</strong></div>\n        <div class="row"><span>ملاحظات</span><strong class="value ">test</strong></div>\n      </section>\n      <table><tbody>\n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>تيراميسو</strong>\n        \n        \n        \n        \n        <small>سعر الوحدة: ILS 5.00</small>\n      </td>\n      <td class="money">ILS 5.00</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>مارغريتا</strong>\n        \n        <small>وسط</small>\n        \n        \n        <small>سعر الوحدة: ILS 9.00</small>\n      </td>\n      <td class="money">ILS 9.00</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>بيبروني حار</strong>\n        \n        <small>وسط</small>\n        \n        \n        <small>سعر الوحدة: ILS 10.50</small>\n      </td>\n      <td class="money">ILS 10.50</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>سلطة حلوم</strong>\n        \n        \n        \n        \n        <small>سعر الوحدة: ILS 7.75</small>\n      </td>\n      <td class="money">ILS 7.75</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>فستق مثلج</strong>\n        \n        <small>عادي</small>\n        \n        \n        <small>سعر الوحدة: ILS 4.25</small>\n      </td>\n      <td class="money">ILS 4.25</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>بطاطا محملة</strong>\n        \n        <small>صغير</small>\n        \n        \n        <small>سعر الوحدة: ILS 4.50</small>\n      </td>\n      <td class="money">ILS 4.50</td>\n    </tr>\n  </tbody></table>\n      <section class="totals">\n        <div class="row "><span>المجموع</span><strong class="value">ILS 41.00</strong></div>\n        <div class="row "><span>الخصم</span><strong class="value">- ILS 4.10</strong></div>\n        \n        \n        \n        <div class="row strong"><span>الإجمالي</span><strong class="value">ILS 36.90</strong></div>\n        <div class="row "><span>المدفوع</span><strong class="value">ILS 36.90</strong></div>\n        \n      </section>\n      <footer>\n        <strong>شكراً لزيارتكم</strong>\n        <p>الأسعار تشمل الضريبة</p>\n        <p>الرقم الضريبي: <span dir="ltr">310048229</span></p>\n        <p class="invoice-number">cmrs8m6jt0001w89neogjma52</p>\n      </footer>\n    </main></body></html>	1	W80	\N	PRINTED	1	5	\N	\N	invoice:cmrs8m6jt0001w89neogjma52:receipt:reprint:1784495148885	2026-07-19 21:05:48.888	2026-07-19 21:06:05.255	2026-07-19 21:06:08.54	2026-07-19 21:06:09.85	\N	\N	f	\N	\N	f
cmrs5gl6i000auw9nkab49rsb	cmr97q88n0000rs9nh4sethxg	cmrs0kvf90002t89nnfc21r9f	cmrs4db040007cg9nzhr3t2fc	cmrs5f6rn0001uw9n5yczkqh6	\N	cmrs5f6tf0006uw9n0he9puto	CUSTOMER_RECEIPT	HTML	<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>\n    @page{margin:0;size:80mm auto}*{box-sizing:border-box}html,body{width:80mm;margin:0;padding:0;background:#fff;color:#000;font-family:Arial,Tahoma,sans-serif}\n    body{padding:4mm;font-size:11px;line-height:1.35}.ticket body{font-size:13px}h1{font-size:17px;margin:0 0 2mm;text-align:center}p{margin:0}header{text-align:center}\n    .meta,.totals{border-top:1px dashed #000;border-bottom:1px dashed #000;margin:3mm 0;padding:2mm 0}.line{display:flex;justify-content:space-between;gap:3mm}.line strong{font-size:14px}\n    table{width:100%;border-collapse:collapse}td{padding:1.5mm 0;vertical-align:top;border-bottom:1px dotted #999}.qty{width:9mm;font-weight:bold}.money{text-align:end;white-space:nowrap}small{display:block;color:#333;margin-top:1mm}footer{text-align:center;margin-top:4mm;font-weight:bold}\n  </style></head><body class="receipt">\n    <header>\n      <h1>شيخ الكار</h1>\n      <p>الفرع الرئيسي - Ramallah, Palestine</p>\n    <p><strong>REPRINT / إعادة طباعة</strong></p></header>\n    <section class="meta">\n      <div class="line "><span>الفاتورة</span><strong>#MAIN-REG-MAIN-01-2026-000020</strong></div>\n      <div class="line "><span>الطلب</span><strong>-</strong></div>\n      <div class="line "><span>الكاشير</span><strong>Omar Khalil</strong></div>\n      <div class="line "><span>الوقت</span><strong>19‏/7‏/2026، 9:48:12 م</strong></div>\n    </section>\n    <table>\n    <tr>\n      <td class="qty">1x</td>\n      <td>\n        <strong>تيراميسو</strong>\n        \n        \n      </td>\n      <td class="money">₪ 5.00</td>\n    </tr>\n    <tr>\n      <td class="qty">1x</td>\n      <td>\n        <strong>فستق مثلج</strong>\n        <small>عادي</small>\n        \n      </td>\n      <td class="money">₪ 4.25</td>\n    </tr></table>\n    <section class="totals">\n      <div class="line "><span>المجموع</span><strong>₪ 9.25</strong></div>\n      \n      \n      <div class="line strong"><span>الإجمالي</span><strong>₪ 9.25</strong></div>\n      <div class="line "><span>الدفع</span><strong>نقداً ILS 9.25</strong></div>\n    </section>\n    <footer>شكراً لزيارتكم</footer></body></html>	1	W80	\N	FAILED	5	5	WINDOWS_PRINT_ERROR	Invalid printer settings	invoice:cmrs5f6rn0001uw9n5yczkqh6:receipt:reprint:1784486958137	2026-07-19 18:49:18.138	2026-07-19 18:49:18.175	2026-07-19 18:51:19.514	\N	2026-07-19 18:51:20.1	\N	f	\N	\N	f
cmvj6y25d0007es9n9fyuspi1	cmr97q88n0000rs9nh4sethxg	cmrs0kvf90002t89nnfc21r9f	cmrs4db040007cg9nzhr3t2fc	cmvj6y1xm0001es9nc5t1xv5m	\N	\N	CUSTOMER_RECEIPT	HTML	<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>\n    :root{--receipt-width:60mm}@page{size:60mm auto;margin:0}*{box-sizing:border-box}\n    body.receipt-document{width:var(--receipt-width);margin:0;padding:0;background:#fff;color:#000;overflow:visible;font-family:Arial,Tahoma,"Segoe UI",sans-serif}\n    .receipt{width:var(--receipt-width);min-width:var(--receipt-width);max-width:var(--receipt-width);padding:4mm;box-sizing:border-box;font-family:Arial,Tahoma,"Segoe UI",sans-serif;font-size:11px;line-height:1.35;color:#000;background:#fff;overflow:visible;height:auto;max-height:none}\n    .receipt .logo{width:17mm;height:17mm;object-fit:contain;display:block;margin:0 auto 2mm}.receipt h1{font-size:17px;margin:0 0 1mm;text-align:center}.receipt p{margin:0 0 1mm}.receipt header,.receipt footer{text-align:center}\n    .receipt .center{text-align:center}.receipt .en{direction:ltr}.receipt .meta,.receipt .totals{border-top:1px dashed #000;border-bottom:1px dashed #000;margin:3mm 0;padding:2mm 0}\n    .receipt .row{display:flex;justify-content:space-between;align-items:flex-start;gap:3mm;margin:1mm 0}.receipt .row span:first-child{flex:0 0 auto}.receipt .value{overflow-wrap:anywhere;word-break:break-word;text-align:end;max-width:45mm}\n    .receipt .invoice-number{max-width:100%;overflow-wrap:anywhere;word-break:break-word;white-space:normal;direction:ltr;text-align:left}\n    .receipt table{width:100%;border-collapse:collapse}.receipt td{padding:1.5mm 0;vertical-align:top;border-bottom:1px dotted #999}.receipt .qty{width:9mm;font-weight:bold}.receipt .item-name{overflow-wrap:anywhere;word-break:break-word}.receipt .money{text-align:end;white-space:nowrap}\n    .receipt small{display:block;color:#333;margin-top:1mm}.receipt .strong{font-size:14px;font-weight:bold}.receipt footer{margin-top:4mm;font-size:10px}\n  </style></head><body class="receipt receipt-document">\n    <main class="receipt">\n      <header>\n        <img class="logo" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3QgeD0iNTQiIHk9IjQ2IiB3aWR0aD0iNDA0IiBoZWlnaHQ9IjQyMCIgcng9Ijg2IiBmaWxsPSIjRjg2ODAwIi8+PHBhdGggZD0iTTEzNSAxMjhoMjQyYzIyIDAgNDAgMTggNDAgNDB2MTI4YzAgMzEtMjUgNTYtNTYgNTZoLTRjLTI3IDAtNDktMjItNDktNDl2LTg3SDIwNHY4N2MwIDI3LTIyIDQ5LTQ5IDQ5aC00Yy0zMSAwLTU2LTI1LTU2LTU2VjE2OGMwLTIyIDE4LTQwIDQwLTQwWiIgZmlsbD0iI0ZGRkZGRiIvPjxwYXRoIGQ9Ik0yMDkgMTc0aDExOGwtMjEgODZjLTUgMjEgMiA0MyAxOCA1OGwxMyAxMkgyMTBjMjgtMzAgNDEtNjUgMzktMTA1bC00MC01MVoiIGZpbGw9IiNGODY4MDAiLz48cGF0aCBkPSJNMjAzIDE2OGgxMzhsLTEyIDQ2SDIxNmwtMTMtNDZaIiBmaWxsPSIjRkY4QTFGIi8+PHBhdGggZD0iTTIyMiAyMjNoNTJjMyAyNSAwIDUzLTkgODMiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIxMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTI5NCAyMjRjNiAzMyA2IDY3IDAgMTAxTTMyMCAyMjRjNSAzNCA1IDY4IDAgMTAxTTM0NSAyMjRjNCAzMiA0IDY1IDAgOTgiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIxMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTIwOSAzNTdjLTggMjQtMjAgNDMtMzkgNTdoMTUzYy0xNS0xMy0yNC0zMS0yNi01N0gyMDlaIiBmaWxsPSIjRkZGRkZGIi8+PC9zdmc+" alt="Sheikh Al Kar logo">\n        <h1>شيخ الكار</h1>\n        <p class="en center">Sheikh Al Kar</p>\n        <p>الفرع الرئيسي</p>\n        <p>Ramallah, Palestine</p>\n        \n        <p>الرقم الضريبي: <span dir="ltr">310048229</span></p>\n        \n      </header>\n      <section class="meta">\n        <div class="row"><span>الفاتورة</span><strong class="value invoice-number">#MAIN-REG-MAIN-01-2026-000028</strong></div>\n        <div class="row"><span>التاريخ</span><strong class="value ">22‏/10‏/2026</strong></div>\n        <div class="row"><span>الوقت</span><strong class="value ">09:59 ص</strong></div>\n        <div class="row"><span>الموظف</span><strong class="value ">Omar Khalil</strong></div>\n        \n        \n        <div class="row"><span>طريقة الدفع</span><strong class="value ">نقداً</strong></div>\n        <div class="row"><span>العملة</span><strong class="value ">ILS</strong></div>\n        <div class="row"><span>المدفوع</span><strong class="value ">ILS 12.75</strong></div>\n        <div class="row"><span>طريقة التسليم</span><strong class="value ">سفري</strong></div>\n        <div class="row"><span>نوع الطلب</span><strong class="value ">سفري</strong></div>\n        \n      </section>\n      <table><tbody>\n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>فستق �ثلج</strong>\n        <small class="en">Iced Pistachio</small>\n        <small>عادي</small>\n        \n        \n        <small>سعر الوحدة: ILS 4.25</small>\n      </td>\n      <td class="money">ILS 4.25</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>برغر الترفل</strong>\n        <small class="en">Truffle Smash</small>\n        <small>عادي</small>\n        \n        \n        <small>سعر الوحدة: ILS 8.50</small>\n      </td>\n      <td class="money">ILS 8.50</td>\n    </tr>\n  </tbody></table>\n      <section class="totals">\n        <div class="row "><span>المجموع</span><strong class="value">ILS 12.75</strong></div>\n        \n        \n        \n        \n        <div class="row strong"><span>الإجمالي</span><strong class="value">ILS 12.75</strong></div>\n        <div class="row "><span>المدفوع</span><strong class="value">ILS 12.75</strong></div>\n        \n      </section>\n      <footer>\n        <strong>شكراً لزيارتكم</strong>\n        <p>الأسعار تشمل الضريبة</p>\n        <p>الرقم الضريبي: <span dir="ltr">310048229</span></p>\n        <p class="invoice-number">cmvj6y1xm0001es9nc5t1xv5m</p>\n      </footer>\n    </main></body></html>	1	W80	\N	PENDING	0	5	\N	\N	invoice:cmvj6y1xm0001es9nc5t1xv5m:receipt:cmrs4db040007cg9nzhr3t2fc	2026-10-22 06:59:46.657	\N	\N	\N	\N	\N	f	\N	\N	f
cmrs5gu30000buw9nxqbrjsnd	cmr97q88n0000rs9nh4sethxg	cmrs0kvf90002t89nnfc21r9f	cmrs4db040007cg9nzhr3t2fc	cmrs5f6rn0001uw9n5yczkqh6	\N	cmrs5f6tf0006uw9n0he9puto	CUSTOMER_RECEIPT	HTML	<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>\n    @page{margin:0;size:80mm auto}*{box-sizing:border-box}html,body{width:80mm;margin:0;padding:0;background:#fff;color:#000;font-family:Arial,Tahoma,sans-serif}\n    body{padding:4mm;font-size:11px;line-height:1.35}.ticket body{font-size:13px}h1{font-size:17px;margin:0 0 2mm;text-align:center}p{margin:0}header{text-align:center}\n    .meta,.totals{border-top:1px dashed #000;border-bottom:1px dashed #000;margin:3mm 0;padding:2mm 0}.line{display:flex;justify-content:space-between;gap:3mm}.line strong{font-size:14px}\n    table{width:100%;border-collapse:collapse}td{padding:1.5mm 0;vertical-align:top;border-bottom:1px dotted #999}.qty{width:9mm;font-weight:bold}.money{text-align:end;white-space:nowrap}small{display:block;color:#333;margin-top:1mm}footer{text-align:center;margin-top:4mm;font-weight:bold}\n  </style></head><body class="receipt">\n    <header>\n      <h1>شيخ الكار</h1>\n      <p>الفرع الرئيسي - Ramallah, Palestine</p>\n    <p><strong>REPRINT / إعادة طباعة</strong></p></header>\n    <section class="meta">\n      <div class="line "><span>الفاتورة</span><strong>#MAIN-REG-MAIN-01-2026-000020</strong></div>\n      <div class="line "><span>الطلب</span><strong>-</strong></div>\n      <div class="line "><span>الكاشير</span><strong>Omar Khalil</strong></div>\n      <div class="line "><span>الوقت</span><strong>19‏/7‏/2026، 9:48:12 م</strong></div>\n    </section>\n    <table>\n    <tr>\n      <td class="qty">1x</td>\n      <td>\n        <strong>تيراميسو</strong>\n        \n        \n      </td>\n      <td class="money">₪ 5.00</td>\n    </tr>\n    <tr>\n      <td class="qty">1x</td>\n      <td>\n        <strong>فستق مثلج</strong>\n        <small>عادي</small>\n        \n      </td>\n      <td class="money">₪ 4.25</td>\n    </tr></table>\n    <section class="totals">\n      <div class="line "><span>المجموع</span><strong>₪ 9.25</strong></div>\n      \n      \n      <div class="line strong"><span>الإجمالي</span><strong>₪ 9.25</strong></div>\n      <div class="line "><span>الدفع</span><strong>نقداً ILS 9.25</strong></div>\n    </section>\n    <footer>شكراً لزيارتكم</footer></body></html>	1	W80	\N	FAILED	5	5	WINDOWS_PRINT_ERROR	Invalid printer settings	invoice:cmrs5f6rn0001uw9n5yczkqh6:receipt:reprint:1784486969675	2026-07-19 18:49:29.676	2026-07-19 18:49:29.711	2026-07-19 18:51:36.265	\N	2026-07-19 18:51:36.849	\N	f	\N	\N	f
cmrs5kjuo000juw9n2keqwyvu	cmr97q88n0000rs9nh4sethxg	cmrs0kvf90002t89nnfc21r9f	cmrs4db040007cg9nzhr3t2fc	cmrs5kjt2000euw9nyoi3rcln	\N	\N	CUSTOMER_RECEIPT	HTML	<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>\n    @page{margin:0;size:80mm auto}*{box-sizing:border-box}html,body{width:80mm;margin:0;padding:0;background:#fff;color:#000;font-family:Arial,Tahoma,sans-serif}\n    body{padding:4mm;font-size:11px;line-height:1.35}.ticket body{font-size:13px}h1{font-size:17px;margin:0 0 2mm;text-align:center}p{margin:0}header{text-align:center}\n    .meta,.totals{border-top:1px dashed #000;border-bottom:1px dashed #000;margin:3mm 0;padding:2mm 0}.line{display:flex;justify-content:space-between;gap:3mm}.line strong{font-size:14px}\n    table{width:100%;border-collapse:collapse}td{padding:1.5mm 0;vertical-align:top;border-bottom:1px dotted #999}.qty{width:9mm;font-weight:bold}.money{text-align:end;white-space:nowrap}small{display:block;color:#333;margin-top:1mm}footer{text-align:center;margin-top:4mm;font-weight:bold}\n  </style></head><body class="receipt">\n    <header>\n      <h1>شيخ الكار</h1>\n      <p>الفرع الرئيسي - Ramallah, Palestine</p>\n    </header>\n    <section class="meta">\n      <div class="line "><span>الفاتورة</span><strong>#MAIN-REG-MAIN-01-2026-000021</strong></div>\n      <div class="line "><span>الطلب</span><strong>-</strong></div>\n      <div class="line "><span>الكاشير</span><strong>Omar Khalil</strong></div>\n      <div class="line "><span>الوقت</span><strong>19‏/7‏/2026، 9:52:22 م</strong></div>\n    </section>\n    <table>\n    <tr>\n      <td class="qty">1x</td>\n      <td>\n        <strong>فستق مثلج</strong>\n        <small>عادي</small>\n        \n      </td>\n      <td class="money">₪ 4.25</td>\n    </tr>\n    <tr>\n      <td class="qty">1x</td>\n      <td>\n        <strong>تيراميسو</strong>\n        \n        \n      </td>\n      <td class="money">₪ 5.00</td>\n    </tr></table>\n    <section class="totals">\n      <div class="line "><span>المجموع</span><strong>₪ 9.25</strong></div>\n      \n      \n      <div class="line strong"><span>الإجمالي</span><strong>₪ 9.25</strong></div>\n      <div class="line "><span>الدفع</span><strong>نقداً ILS 9.25</strong></div>\n    </section>\n    <footer>شكراً لزيارتكم</footer></body></html>	1	W80	\N	FAILED	5	5	WINDOWS_PRINT_ERROR	Invalid printer settings	invoice:cmrs5kjt2000euw9nyoi3rcln:receipt:cmrs4db040007cg9nzhr3t2fc	2026-07-19 18:52:23.04	2026-07-19 18:52:23.104	2026-07-19 18:53:05.797	\N	2026-07-19 18:53:06.389	\N	f	\N	\N	f
cmrs7fncr000ddg9n4vrmwz14	cmr97q88n0000rs9nh4sethxg	cmrs0kvf90002t89nnfc21r9f	cmrs4db040007cg9nzhr3t2fc	cmrs6mlhe0001dg9n8x68yq83	\N	cmrs6mlku0006dg9n9fg8ezfk	CUSTOMER_RECEIPT	HTML	<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>\n    @page{margin:0;size:80mm auto}*{box-sizing:border-box}html,body{width:80mm;margin:0;padding:0;background:#fff;color:#000;font-family:Arial,Tahoma,sans-serif}\n    body{padding:4mm;font-size:11px;line-height:1.35}.ticket body{font-size:13px}h1{font-size:17px;margin:0 0 2mm;text-align:center}p{margin:0}header{text-align:center}\n    .meta,.totals{border-top:1px dashed #000;border-bottom:1px dashed #000;margin:3mm 0;padding:2mm 0}.line{display:flex;justify-content:space-between;gap:3mm}.line strong{font-size:14px}\n    table{width:100%;border-collapse:collapse}td{padding:1.5mm 0;vertical-align:top;border-bottom:1px dotted #999}.qty{width:9mm;font-weight:bold}.money{text-align:end;white-space:nowrap}small{display:block;color:#333;margin-top:1mm}footer{text-align:center;margin-top:4mm;font-weight:bold}\n  </style></head><body class="receipt">\n    <header>\n      <h1>شيخ الكار</h1>\n      <p>الفرع الرئيسي - Ramallah, Palestine</p>\n    <p><strong>REPRINT / إعادة طباعة</strong></p></header>\n    <section class="meta">\n      <div class="line "><span>الفاتورة</span><strong>#MAIN-REG-MAIN-01-2026-000022</strong></div>\n      <div class="line "><span>الطلب</span><strong>-</strong></div>\n      <div class="line "><span>الكاشير</span><strong>Omar Khalil</strong></div>\n      <div class="line "><span>الوقت</span><strong>19‏/7‏/2026، 10:21:58 م</strong></div>\n    </section>\n    <table>\n    <tr>\n      <td class="qty">1x</td>\n      <td>\n        <strong>فستق مثلج</strong>\n        <small>عادي</small>\n        \n      </td>\n      <td class="money">₪ 4.25</td>\n    </tr>\n    <tr>\n      <td class="qty">1x</td>\n      <td>\n        <strong>تيراميسو</strong>\n        \n        \n      </td>\n      <td class="money">₪ 5.00</td>\n    </tr></table>\n    <section class="totals">\n      <div class="line "><span>المجموع</span><strong>₪ 9.25</strong></div>\n      \n      \n      <div class="line strong"><span>الإجمالي</span><strong>₪ 9.25</strong></div>\n      <div class="line "><span>الدفع</span><strong>نقداً ILS 9.25</strong></div>\n    </section>\n    <footer>شكراً لزيارتكم</footer></body></html>	1	W80	\N	PRINTED	1	5	\N	\N	invoice:cmrs6mlhe0001dg9n8x68yq83:receipt:reprint:1784490273530	2026-07-19 19:44:33.531	2026-07-19 19:44:33.567	2026-07-19 19:44:33.62	2026-07-19 19:44:34.844	\N	\N	f	\N	\N	f
cmrs5jjob000cuw9n824je5a8	cmr97q88n0000rs9nh4sethxg	cmrs0kvf90002t89nnfc21r9f	cmrs4db040007cg9nzhr3t2fc	cmrs5f6rn0001uw9n5yczkqh6	\N	cmrs5f6tf0006uw9n0he9puto	CUSTOMER_RECEIPT	HTML	<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>\n    @page{margin:0;size:80mm auto}*{box-sizing:border-box}html,body{width:80mm;margin:0;padding:0;background:#fff;color:#000;font-family:Arial,Tahoma,sans-serif}\n    body{padding:4mm;font-size:11px;line-height:1.35}.ticket body{font-size:13px}h1{font-size:17px;margin:0 0 2mm;text-align:center}p{margin:0}header{text-align:center}\n    .meta,.totals{border-top:1px dashed #000;border-bottom:1px dashed #000;margin:3mm 0;padding:2mm 0}.line{display:flex;justify-content:space-between;gap:3mm}.line strong{font-size:14px}\n    table{width:100%;border-collapse:collapse}td{padding:1.5mm 0;vertical-align:top;border-bottom:1px dotted #999}.qty{width:9mm;font-weight:bold}.money{text-align:end;white-space:nowrap}small{display:block;color:#333;margin-top:1mm}footer{text-align:center;margin-top:4mm;font-weight:bold}\n  </style></head><body class="receipt">\n    <header>\n      <h1>شيخ الكار</h1>\n      <p>الفرع الرئيسي - Ramallah, Palestine</p>\n    <p><strong>REPRINT / إعادة طباعة</strong></p></header>\n    <section class="meta">\n      <div class="line "><span>الفاتورة</span><strong>#MAIN-REG-MAIN-01-2026-000020</strong></div>\n      <div class="line "><span>الطلب</span><strong>-</strong></div>\n      <div class="line "><span>الكاشير</span><strong>Omar Khalil</strong></div>\n      <div class="line "><span>الوقت</span><strong>19‏/7‏/2026، 9:48:12 م</strong></div>\n    </section>\n    <table>\n    <tr>\n      <td class="qty">1x</td>\n      <td>\n        <strong>تيراميسو</strong>\n        \n        \n      </td>\n      <td class="money">₪ 5.00</td>\n    </tr>\n    <tr>\n      <td class="qty">1x</td>\n      <td>\n        <strong>فستق مثلج</strong>\n        <small>عادي</small>\n        \n      </td>\n      <td class="money">₪ 4.25</td>\n    </tr></table>\n    <section class="totals">\n      <div class="line "><span>المجموع</span><strong>₪ 9.25</strong></div>\n      \n      \n      <div class="line strong"><span>الإجمالي</span><strong>₪ 9.25</strong></div>\n      <div class="line "><span>الدفع</span><strong>نقداً ILS 9.25</strong></div>\n    </section>\n    <footer>شكراً لزيارتكم</footer></body></html>	1	W80	\N	FAILED	5	5	WINDOWS_PRINT_ERROR	Invalid printer settings	invoice:cmrs5f6rn0001uw9n5yczkqh6:receipt:reprint:1784487096154	2026-07-19 18:51:36.155	2026-07-19 18:51:36.194	2026-07-19 18:52:33.824	\N	2026-07-19 18:52:34.411	\N	f	\N	\N	f
cmrs5ks3h000luw9n6gqx3w5r	cmr97q88n0000rs9nh4sethxg	cmrs0kvf90002t89nnfc21r9f	cmrs4db040007cg9nzhr3t2fc	cmrs5kjt2000euw9nyoi3rcln	\N	cmrs5kjuo000juw9n2keqwyvu	CUSTOMER_RECEIPT	HTML	<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>\n    @page{margin:0;size:80mm auto}*{box-sizing:border-box}html,body{width:80mm;margin:0;padding:0;background:#fff;color:#000;font-family:Arial,Tahoma,sans-serif}\n    body{padding:4mm;font-size:11px;line-height:1.35}.ticket body{font-size:13px}h1{font-size:17px;margin:0 0 2mm;text-align:center}p{margin:0}header{text-align:center}\n    .meta,.totals{border-top:1px dashed #000;border-bottom:1px dashed #000;margin:3mm 0;padding:2mm 0}.line{display:flex;justify-content:space-between;gap:3mm}.line strong{font-size:14px}\n    table{width:100%;border-collapse:collapse}td{padding:1.5mm 0;vertical-align:top;border-bottom:1px dotted #999}.qty{width:9mm;font-weight:bold}.money{text-align:end;white-space:nowrap}small{display:block;color:#333;margin-top:1mm}footer{text-align:center;margin-top:4mm;font-weight:bold}\n  </style></head><body class="receipt">\n    <header>\n      <h1>شيخ الكار</h1>\n      <p>الفرع الرئيسي - Ramallah, Palestine</p>\n    <p><strong>REPRINT / إعادة طباعة</strong></p></header>\n    <section class="meta">\n      <div class="line "><span>الفاتورة</span><strong>#MAIN-REG-MAIN-01-2026-000021</strong></div>\n      <div class="line "><span>الطلب</span><strong>-</strong></div>\n      <div class="line "><span>الكاشير</span><strong>Omar Khalil</strong></div>\n      <div class="line "><span>الوقت</span><strong>19‏/7‏/2026، 9:52:22 م</strong></div>\n    </section>\n    <table>\n    <tr>\n      <td class="qty">1x</td>\n      <td>\n        <strong>فستق مثلج</strong>\n        <small>عادي</small>\n        \n      </td>\n      <td class="money">₪ 4.25</td>\n    </tr>\n    <tr>\n      <td class="qty">1x</td>\n      <td>\n        <strong>تيراميسو</strong>\n        \n        \n      </td>\n      <td class="money">₪ 5.00</td>\n    </tr></table>\n    <section class="totals">\n      <div class="line "><span>المجموع</span><strong>₪ 9.25</strong></div>\n      \n      \n      <div class="line strong"><span>الإجمالي</span><strong>₪ 9.25</strong></div>\n      <div class="line "><span>الدفع</span><strong>نقداً ILS 9.25</strong></div>\n    </section>\n    <footer>شكراً لزيارتكم</footer></body></html>	1	W80	\N	FAILED	5	5	WINDOWS_PRINT_ERROR	Invalid printer settings	invoice:cmrs5kjt2000euw9nyoi3rcln:receipt:reprint:1784487153724	2026-07-19 18:52:33.725	2026-07-19 18:52:33.764	2026-07-19 19:20:23.554	\N	2026-07-19 19:20:25.274	\N	f	\N	\N	f
cmrs6rv9e0008dg9n9ug82v7m	cmr97q88n0000rs9nh4sethxg	cmrs0kvf90002t89nnfc21r9f	cmrs4db040007cg9nzhr3t2fc	cmrs6mlhe0001dg9n8x68yq83	\N	cmrs6mlku0006dg9n9fg8ezfk	CUSTOMER_RECEIPT	HTML	<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>\n    @page{margin:0;size:80mm auto}*{box-sizing:border-box}html,body{width:80mm;margin:0;padding:0;background:#fff;color:#000;font-family:Arial,Tahoma,sans-serif}\n    body{padding:4mm;font-size:11px;line-height:1.35}.ticket body{font-size:13px}h1{font-size:17px;margin:0 0 2mm;text-align:center}p{margin:0}header{text-align:center}\n    .meta,.totals{border-top:1px dashed #000;border-bottom:1px dashed #000;margin:3mm 0;padding:2mm 0}.line{display:flex;justify-content:space-between;gap:3mm}.line strong{font-size:14px}\n    table{width:100%;border-collapse:collapse}td{padding:1.5mm 0;vertical-align:top;border-bottom:1px dotted #999}.qty{width:9mm;font-weight:bold}.money{text-align:end;white-space:nowrap}small{display:block;color:#333;margin-top:1mm}footer{text-align:center;margin-top:4mm;font-weight:bold}\n  </style></head><body class="receipt">\n    <header>\n      <h1>شيخ الكار</h1>\n      <p>الفرع الرئيسي - Ramallah, Palestine</p>\n    <p><strong>REPRINT / إعادة طباعة</strong></p></header>\n    <section class="meta">\n      <div class="line "><span>الفاتورة</span><strong>#MAIN-REG-MAIN-01-2026-000022</strong></div>\n      <div class="line "><span>الطلب</span><strong>-</strong></div>\n      <div class="line "><span>الكاشير</span><strong>Omar Khalil</strong></div>\n      <div class="line "><span>الوقت</span><strong>19‏/7‏/2026، 10:21:58 م</strong></div>\n    </section>\n    <table>\n    <tr>\n      <td class="qty">1x</td>\n      <td>\n        <strong>فستق مثلج</strong>\n        <small>عادي</small>\n        \n      </td>\n      <td class="money">₪ 4.25</td>\n    </tr>\n    <tr>\n      <td class="qty">1x</td>\n      <td>\n        <strong>تيراميسو</strong>\n        \n        \n      </td>\n      <td class="money">₪ 5.00</td>\n    </tr></table>\n    <section class="totals">\n      <div class="line "><span>المجموع</span><strong>₪ 9.25</strong></div>\n      \n      \n      <div class="line strong"><span>الإجمالي</span><strong>₪ 9.25</strong></div>\n      <div class="line "><span>الدفع</span><strong>نقداً ILS 9.25</strong></div>\n    </section>\n    <footer>شكراً لزيارتكم</footer></body></html>	1	W80	\N	FAILED	5	5	WINDOWS_PRINT_ERROR	Invalid printer settings	invoice:cmrs6mlhe0001dg9n8x68yq83:receipt:reprint:1784489164028	2026-07-19 19:26:04.034	2026-07-19 19:26:04.105	2026-07-19 19:29:13.234	\N	2026-07-19 19:29:13.808	\N	f	\N	\N	f
cmrs5m6zb000muw9nokp5rs2v	cmr97q88n0000rs9nh4sethxg	cmrs0kvf90002t89nnfc21r9f	cmrs4db040007cg9nzhr3t2fc	cmrs5kjt2000euw9nyoi3rcln	\N	cmrs5kjuo000juw9n2keqwyvu	CUSTOMER_RECEIPT	HTML	<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>\n    @page{margin:0;size:80mm auto}*{box-sizing:border-box}html,body{width:80mm;margin:0;padding:0;background:#fff;color:#000;font-family:Arial,Tahoma,sans-serif}\n    body{padding:4mm;font-size:11px;line-height:1.35}.ticket body{font-size:13px}h1{font-size:17px;margin:0 0 2mm;text-align:center}p{margin:0}header{text-align:center}\n    .meta,.totals{border-top:1px dashed #000;border-bottom:1px dashed #000;margin:3mm 0;padding:2mm 0}.line{display:flex;justify-content:space-between;gap:3mm}.line strong{font-size:14px}\n    table{width:100%;border-collapse:collapse}td{padding:1.5mm 0;vertical-align:top;border-bottom:1px dotted #999}.qty{width:9mm;font-weight:bold}.money{text-align:end;white-space:nowrap}small{display:block;color:#333;margin-top:1mm}footer{text-align:center;margin-top:4mm;font-weight:bold}\n  </style></head><body class="receipt">\n    <header>\n      <h1>شيخ الكار</h1>\n      <p>الفرع الرئيسي - Ramallah, Palestine</p>\n    <p><strong>REPRINT / إعادة طباعة</strong></p></header>\n    <section class="meta">\n      <div class="line "><span>الفاتورة</span><strong>#MAIN-REG-MAIN-01-2026-000021</strong></div>\n      <div class="line "><span>الطلب</span><strong>-</strong></div>\n      <div class="line "><span>الكاشير</span><strong>Omar Khalil</strong></div>\n      <div class="line "><span>الوقت</span><strong>19‏/7‏/2026، 9:52:22 م</strong></div>\n    </section>\n    <table>\n    <tr>\n      <td class="qty">1x</td>\n      <td>\n        <strong>فستق مثلج</strong>\n        <small>عادي</small>\n        \n      </td>\n      <td class="money">₪ 4.25</td>\n    </tr>\n    <tr>\n      <td class="qty">1x</td>\n      <td>\n        <strong>تيراميسو</strong>\n        \n        \n      </td>\n      <td class="money">₪ 5.00</td>\n    </tr></table>\n    <section class="totals">\n      <div class="line "><span>المجموع</span><strong>₪ 9.25</strong></div>\n      \n      \n      <div class="line strong"><span>الإجمالي</span><strong>₪ 9.25</strong></div>\n      <div class="line "><span>الدفع</span><strong>نقداً ILS 9.25</strong></div>\n    </section>\n    <footer>شكراً لزيارتكم</footer></body></html>	1	W80	\N	FAILED	5	5	WINDOWS_PRINT_ERROR	Invalid printer settings	invoice:cmrs5kjt2000euw9nyoi3rcln:receipt:reprint:1784487219670	2026-07-19 18:53:39.671	2026-07-19 18:53:39.71	2026-07-19 19:20:42.503	\N	2026-07-19 19:20:43.123	\N	f	\N	\N	f
cmrs743j2000cdg9n226pcghq	cmr97q88n0000rs9nh4sethxg	cmrs0kvf90002t89nnfc21r9f	cmrs4db040007cg9nzhr3t2fc	cmrs6mlhe0001dg9n8x68yq83	\N	cmrs6mlku0006dg9n9fg8ezfk	CUSTOMER_RECEIPT	HTML	<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>\n    @page{margin:0;size:80mm auto}*{box-sizing:border-box}html,body{width:80mm;margin:0;padding:0;background:#fff;color:#000;font-family:Arial,Tahoma,sans-serif}\n    body{padding:4mm;font-size:11px;line-height:1.35}.ticket body{font-size:13px}h1{font-size:17px;margin:0 0 2mm;text-align:center}p{margin:0}header{text-align:center}\n    .meta,.totals{border-top:1px dashed #000;border-bottom:1px dashed #000;margin:3mm 0;padding:2mm 0}.line{display:flex;justify-content:space-between;gap:3mm}.line strong{font-size:14px}\n    table{width:100%;border-collapse:collapse}td{padding:1.5mm 0;vertical-align:top;border-bottom:1px dotted #999}.qty{width:9mm;font-weight:bold}.money{text-align:end;white-space:nowrap}small{display:block;color:#333;margin-top:1mm}footer{text-align:center;margin-top:4mm;font-weight:bold}\n  </style></head><body class="receipt">\n    <header>\n      <h1>شيخ الكار</h1>\n      <p>الفرع الرئيسي - Ramallah, Palestine</p>\n    <p><strong>REPRINT / إعادة طباعة</strong></p></header>\n    <section class="meta">\n      <div class="line "><span>الفاتورة</span><strong>#MAIN-REG-MAIN-01-2026-000022</strong></div>\n      <div class="line "><span>الطلب</span><strong>-</strong></div>\n      <div class="line "><span>الكاشير</span><strong>Omar Khalil</strong></div>\n      <div class="line "><span>الوقت</span><strong>19‏/7‏/2026، 10:21:58 م</strong></div>\n    </section>\n    <table>\n    <tr>\n      <td class="qty">1x</td>\n      <td>\n        <strong>فستق مثلج</strong>\n        <small>عادي</small>\n        \n      </td>\n      <td class="money">₪ 4.25</td>\n    </tr>\n    <tr>\n      <td class="qty">1x</td>\n      <td>\n        <strong>تيراميسو</strong>\n        \n        \n      </td>\n      <td class="money">₪ 5.00</td>\n    </tr></table>\n    <section class="totals">\n      <div class="line "><span>المجموع</span><strong>₪ 9.25</strong></div>\n      \n      \n      <div class="line strong"><span>الإجمالي</span><strong>₪ 9.25</strong></div>\n      <div class="line "><span>الدفع</span><strong>نقداً ILS 9.25</strong></div>\n    </section>\n    <footer>شكراً لزيارتكم</footer></body></html>	1	W80	\N	PRINTED	2	5	\N	\N	invoice:cmrs6mlhe0001dg9n8x68yq83:receipt:reprint:1784489734621	2026-07-19 19:35:34.622	2026-07-19 19:35:34.668	2026-07-19 19:44:19.346	2026-07-19 19:44:22.256	2026-07-19 19:35:35.959	\N	f	\N	\N	f
cmrs6tted0009dg9n19it47a6	cmr97q88n0000rs9nh4sethxg	cmrs0kvf90002t89nnfc21r9f	cmrs4db040007cg9nzhr3t2fc	cmrs6mlhe0001dg9n8x68yq83	\N	cmrs6mlku0006dg9n9fg8ezfk	CUSTOMER_RECEIPT	HTML	<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>\n    @page{margin:0;size:80mm auto}*{box-sizing:border-box}html,body{width:80mm;margin:0;padding:0;background:#fff;color:#000;font-family:Arial,Tahoma,sans-serif}\n    body{padding:4mm;font-size:11px;line-height:1.35}.ticket body{font-size:13px}h1{font-size:17px;margin:0 0 2mm;text-align:center}p{margin:0}header{text-align:center}\n    .meta,.totals{border-top:1px dashed #000;border-bottom:1px dashed #000;margin:3mm 0;padding:2mm 0}.line{display:flex;justify-content:space-between;gap:3mm}.line strong{font-size:14px}\n    table{width:100%;border-collapse:collapse}td{padding:1.5mm 0;vertical-align:top;border-bottom:1px dotted #999}.qty{width:9mm;font-weight:bold}.money{text-align:end;white-space:nowrap}small{display:block;color:#333;margin-top:1mm}footer{text-align:center;margin-top:4mm;font-weight:bold}\n  </style></head><body class="receipt">\n    <header>\n      <h1>شيخ الكار</h1>\n      <p>الفرع الرئيسي - Ramallah, Palestine</p>\n    <p><strong>REPRINT / إعادة طباعة</strong></p></header>\n    <section class="meta">\n      <div class="line "><span>الفاتورة</span><strong>#MAIN-REG-MAIN-01-2026-000022</strong></div>\n      <div class="line "><span>الطلب</span><strong>-</strong></div>\n      <div class="line "><span>الكاشير</span><strong>Omar Khalil</strong></div>\n      <div class="line "><span>الوقت</span><strong>19‏/7‏/2026، 10:21:58 م</strong></div>\n    </section>\n    <table>\n    <tr>\n      <td class="qty">1x</td>\n      <td>\n        <strong>فستق مثلج</strong>\n        <small>عادي</small>\n        \n      </td>\n      <td class="money">₪ 4.25</td>\n    </tr>\n    <tr>\n      <td class="qty">1x</td>\n      <td>\n        <strong>تيراميسو</strong>\n        \n        \n      </td>\n      <td class="money">₪ 5.00</td>\n    </tr></table>\n    <section class="totals">\n      <div class="line "><span>المجموع</span><strong>₪ 9.25</strong></div>\n      \n      \n      <div class="line strong"><span>الإجمالي</span><strong>₪ 9.25</strong></div>\n      <div class="line "><span>الدفع</span><strong>نقداً ILS 9.25</strong></div>\n    </section>\n    <footer>شكراً لزيارتكم</footer></body></html>	1	W80	\N	FAILED	5	5	WINDOWS_PRINT_ERROR	Invalid printer settings	invoice:cmrs6mlhe0001dg9n8x68yq83:receipt:reprint:1784489254932	2026-07-19 19:27:34.933	2026-07-19 19:27:34.966	2026-07-19 19:33:40.912	\N	2026-07-19 19:33:41.548	\N	f	\N	\N	f
cmrs7gn6m000mdg9n4w3gj63t	cmr97q88n0000rs9nh4sethxg	cmrs0kvf90002t89nnfc21r9f	cmrs4db040007cg9nzhr3t2fc	cmrs7gn5m000fdg9nnlkwr5zk	\N	\N	CUSTOMER_RECEIPT	HTML	<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>\n    @page{margin:0;size:80mm auto}*{box-sizing:border-box}html,body{width:80mm;margin:0;padding:0;background:#fff;color:#000;font-family:Arial,Tahoma,sans-serif}\n    body{padding:4mm;font-size:11px;line-height:1.35}.ticket body{font-size:13px}h1{font-size:17px;margin:0 0 2mm;text-align:center}p{margin:0}header{text-align:center}\n    .meta,.totals{border-top:1px dashed #000;border-bottom:1px dashed #000;margin:3mm 0;padding:2mm 0}.line{display:flex;justify-content:space-between;gap:3mm}.line strong{font-size:14px}\n    table{width:100%;border-collapse:collapse}td{padding:1.5mm 0;vertical-align:top;border-bottom:1px dotted #999}.qty{width:9mm;font-weight:bold}.money{text-align:end;white-space:nowrap}small{display:block;color:#333;margin-top:1mm}footer{text-align:center;margin-top:4mm;font-weight:bold}\n  </style></head><body class="receipt">\n    <header>\n      <h1>شيخ الكار</h1>\n      <p>الفرع الرئيسي - Ramallah, Palestine</p>\n    </header>\n    <section class="meta">\n      <div class="line "><span>الفاتورة</span><strong>#MAIN-REG-MAIN-01-2026-000023</strong></div>\n      <div class="line "><span>الطلب</span><strong>-</strong></div>\n      <div class="line "><span>الكاشير</span><strong>Omar Khalil</strong></div>\n      <div class="line "><span>الوقت</span><strong>19‏/7‏/2026، 10:45:19 م</strong></div>\n    </section>\n    <table>\n    <tr>\n      <td class="qty">1x</td>\n      <td>\n        <strong>سلطة حلوم</strong>\n        \n        \n      </td>\n      <td class="money">₪ 7.75</td>\n    </tr>\n    <tr>\n      <td class="qty">1x</td>\n      <td>\n        <strong>تيراميسو</strong>\n        \n        \n      </td>\n      <td class="money">₪ 5.00</td>\n    </tr>\n    <tr>\n      <td class="qty">1x</td>\n      <td>\n        <strong>فستق مثلج</strong>\n        <small>عادي</small>\n        \n      </td>\n      <td class="money">₪ 4.25</td>\n    </tr>\n    <tr>\n      <td class="qty">1x</td>\n      <td>\n        <strong>بيبروني حار</strong>\n        <small>وسط</small>\n        \n      </td>\n      <td class="money">₪ 10.50</td>\n    </tr></table>\n    <section class="totals">\n      <div class="line "><span>المجموع</span><strong>₪ 27.50</strong></div>\n      \n      \n      <div class="line strong"><span>الإجمالي</span><strong>₪ 27.50</strong></div>\n      <div class="line "><span>الدفع</span><strong>نقداً ILS 27.50</strong></div>\n    </section>\n    <footer>شكراً لزيارتكم</footer></body></html>	1	W80	\N	PRINTED	1	5	\N	\N	invoice:cmrs7gn5m000fdg9nnlkwr5zk:receipt:cmrs4db040007cg9nzhr3t2fc	2026-07-19 19:45:19.966	2026-07-19 19:45:20.018	2026-07-19 19:45:20.159	2026-07-19 19:45:21.387	\N	\N	f	\N	\N	f
cmrs83x2p00067o9n0xbvax1h	cmr97q88n0000rs9nh4sethxg	cmrs0kvf90002t89nnfc21r9f	cmrs4db040007cg9nzhr3t2fc	cmrs83x0y00017o9ns49130iy	\N	\N	CUSTOMER_RECEIPT	HTML	<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>\n    @page{size:80mm auto;margin:0}*{box-sizing:border-box}html,body{width:80mm;margin:0;padding:0;background:#fff;color:#000}\n    body{font-family:Arial,Tahoma,"Segoe UI",sans-serif}.receipt{width:80mm;padding:4mm;box-sizing:border-box;font-size:11px;line-height:1.35;color:#000;background:#fff}\n    .logo{width:17mm;height:17mm;object-fit:contain;display:block;margin:0 auto 2mm}h1{font-size:17px;margin:0 0 1mm;text-align:center}p{margin:0 0 1mm}header,footer{text-align:center}\n    .center{text-align:center}.en{direction:ltr}.meta,.totals{border-top:1px dashed #000;border-bottom:1px dashed #000;margin:3mm 0;padding:2mm 0}\n    .row{display:flex;justify-content:space-between;align-items:flex-start;gap:3mm;margin:1mm 0}.row span:first-child{flex:0 0 auto}.value{overflow-wrap:anywhere;word-break:break-word;text-align:end;max-width:45mm}\n    .invoice-number{max-width:100%;overflow-wrap:anywhere;word-break:break-word;white-space:normal;direction:ltr;text-align:left}\n    table{width:100%;border-collapse:collapse}td{padding:1.5mm 0;vertical-align:top;border-bottom:1px dotted #999}.qty{width:9mm;font-weight:bold}.item-name{overflow-wrap:anywhere;word-break:break-word}.money{text-align:end;white-space:nowrap}\n    small{display:block;color:#333;margin-top:1mm}.strong{font-size:14px;font-weight:bold}footer{margin-top:4mm;font-size:10px}\n  </style></head><body class="receipt">\n    <main class="receipt">\n      <header>\n        <img class="logo" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3QgeD0iNTQiIHk9IjQ2IiB3aWR0aD0iNDA0IiBoZWlnaHQ9IjQyMCIgcng9Ijg2IiBmaWxsPSIjRjg2ODAwIi8+PHBhdGggZD0iTTEzNSAxMjhoMjQyYzIyIDAgNDAgMTggNDAgNDB2MTI4YzAgMzEtMjUgNTYtNTYgNTZoLTRjLTI3IDAtNDktMjItNDktNDl2LTg3SDIwNHY4N2MwIDI3LTIyIDQ5LTQ5IDQ5aC00Yy0zMSAwLTU2LTI1LTU2LTU2VjE2OGMwLTIyIDE4LTQwIDQwLTQwWiIgZmlsbD0iI0ZGRkZGRiIvPjxwYXRoIGQ9Ik0yMDkgMTc0aDExOGwtMjEgODZjLTUgMjEgMiA0MyAxOCA1OGwxMyAxMkgyMTBjMjgtMzAgNDEtNjUgMzktMTA1bC00MC01MVoiIGZpbGw9IiNGODY4MDAiLz48cGF0aCBkPSJNMjAzIDE2OGgxMzhsLTEyIDQ2SDIxNmwtMTMtNDZaIiBmaWxsPSIjRkY4QTFGIi8+PHBhdGggZD0iTTIyMiAyMjNoNTJjMyAyNSAwIDUzLTkgODMiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIxMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTI5NCAyMjRjNiAzMyA2IDY3IDAgMTAxTTMyMCAyMjRjNSAzNCA1IDY4IDAgMTAxTTM0NSAyMjRjNCAzMiA0IDY1IDAgOTgiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIxMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTIwOSAzNTdjLTggMjQtMjAgNDMtMzkgNTdoMTUzYy0xNS0xMy0yNC0zMS0yNi01N0gyMDlaIiBmaWxsPSIjRkZGRkZGIi8+PC9zdmc+" alt="Sheikh Al Kar logo">\n        <h1>شيخ الكار</h1>\n        <p class="en center">Sheikh Al Kar</p>\n        <p>الفرع الرئيسي</p>\n        <p>Ramallah, Palestine</p>\n        \n        <p>الرقم الضريبي: <span dir="ltr">310048229</span></p>\n        \n      </header>\n      <section class="meta">\n        <div class="row"><span>الفاتورة</span><strong class="value invoice-number">#MAIN-REG-MAIN-01-2026-000024</strong></div>\n        <div class="row"><span>التاريخ</span><strong class="value ">19‏/7‏/2026</strong></div>\n        <div class="row"><span>الوقت</span><strong class="value ">11:03 م</strong></div>\n        <div class="row"><span>الموظف</span><strong class="value ">Omar Khalil</strong></div>\n        <div class="row"><span>الزبون</span><strong class="value ">فثسف</strong></div>\n        <div class="row"><span>هاتف الزبون</span><strong class="value ">05294816</strong></div>\n        <div class="row"><span>طريقة الدفع</span><strong class="value ">نقداً</strong></div>\n        <div class="row"><span>العملة</span><strong class="value ">ILS</strong></div>\n        <div class="row"><span>المدفوع</span><strong class="value ">ILS 9.25</strong></div>\n        <div class="row"><span>طريقة التسليم</span><strong class="value ">سفري</strong></div>\n        <div class="row"><span>نوع الطلب</span><strong class="value ">سفري</strong></div>\n        <div class="row"><span>ملاحظات</span><strong class="value ">تاغبتعغفؤي</strong></div>\n      </section>\n      <table><tbody>\n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>فستق مثلج</strong>\n        \n        <small>عادي</small>\n        \n        \n        <small>سعر الوحدة: ILS 4.25</small>\n      </td>\n      <td class="money">ILS 4.25</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>تيراميسو</strong>\n        \n        \n        \n        \n        <small>سعر الوحدة: ILS 5.00</small>\n      </td>\n      <td class="money">ILS 5.00</td>\n    </tr>\n  </tbody></table>\n      <section class="totals">\n        <div class="row "><span>المجموع</span><strong class="value">ILS 9.25</strong></div>\n        \n        \n        \n        \n        <div class="row strong"><span>الإجمالي</span><strong class="value">ILS 9.25</strong></div>\n        <div class="row "><span>المدفوع</span><strong class="value">ILS 9.25</strong></div>\n        \n      </section>\n      <footer>\n        <strong>شكراً لزيارتكم</strong>\n        <p>الأسعار تشمل الضريبة</p>\n        <p>الرقم الضريبي: <span dir="ltr">310048229</span></p>\n        <p class="invoice-number">cmrs83x0y00017o9ns49130iy</p>\n      </footer>\n    </main></body></html>	1	W80	\N	PRINTED	1	5	\N	\N	invoice:cmrs83x0y00017o9ns49130iy:receipt:cmrs4db040007cg9nzhr3t2fc	2026-07-19 20:03:25.873	2026-07-19 20:03:26.052	2026-07-19 20:03:27.09	2026-07-19 20:03:29.738	\N	\N	f	\N	\N	f
cmrs8m6n9000aw89np74vlf3c	cmr97q88n0000rs9nh4sethxg	cmrs0kvf90002t89nnfc21r9f	cmrs4db040007cg9nzhr3t2fc	cmrs8m6jt0001w89neogjma52	\N	\N	CUSTOMER_RECEIPT	HTML	<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>\n    @page{size:80mm auto;margin:0}*{box-sizing:border-box}html,body{width:80mm;margin:0;padding:0;background:#fff;color:#000}\n    body{font-family:Arial,Tahoma,"Segoe UI",sans-serif}.receipt{width:80mm;padding:4mm;box-sizing:border-box;font-size:11px;line-height:1.35;color:#000;background:#fff}\n    .logo{width:17mm;height:17mm;object-fit:contain;display:block;margin:0 auto 2mm}h1{font-size:17px;margin:0 0 1mm;text-align:center}p{margin:0 0 1mm}header,footer{text-align:center}\n    .center{text-align:center}.en{direction:ltr}.meta,.totals{border-top:1px dashed #000;border-bottom:1px dashed #000;margin:3mm 0;padding:2mm 0}\n    .row{display:flex;justify-content:space-between;align-items:flex-start;gap:3mm;margin:1mm 0}.row span:first-child{flex:0 0 auto}.value{overflow-wrap:anywhere;word-break:break-word;text-align:end;max-width:45mm}\n    .invoice-number{max-width:100%;overflow-wrap:anywhere;word-break:break-word;white-space:normal;direction:ltr;text-align:left}\n    table{width:100%;border-collapse:collapse}td{padding:1.5mm 0;vertical-align:top;border-bottom:1px dotted #999}.qty{width:9mm;font-weight:bold}.item-name{overflow-wrap:anywhere;word-break:break-word}.money{text-align:end;white-space:nowrap}\n    small{display:block;color:#333;margin-top:1mm}.strong{font-size:14px;font-weight:bold}footer{margin-top:4mm;font-size:10px}\n  </style></head><body class="receipt">\n    <main class="receipt">\n      <header>\n        <img class="logo" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3QgeD0iNTQiIHk9IjQ2IiB3aWR0aD0iNDA0IiBoZWlnaHQ9IjQyMCIgcng9Ijg2IiBmaWxsPSIjRjg2ODAwIi8+PHBhdGggZD0iTTEzNSAxMjhoMjQyYzIyIDAgNDAgMTggNDAgNDB2MTI4YzAgMzEtMjUgNTYtNTYgNTZoLTRjLTI3IDAtNDktMjItNDktNDl2LTg3SDIwNHY4N2MwIDI3LTIyIDQ5LTQ5IDQ5aC00Yy0zMSAwLTU2LTI1LTU2LTU2VjE2OGMwLTIyIDE4LTQwIDQwLTQwWiIgZmlsbD0iI0ZGRkZGRiIvPjxwYXRoIGQ9Ik0yMDkgMTc0aDExOGwtMjEgODZjLTUgMjEgMiA0MyAxOCA1OGwxMyAxMkgyMTBjMjgtMzAgNDEtNjUgMzktMTA1bC00MC01MVoiIGZpbGw9IiNGODY4MDAiLz48cGF0aCBkPSJNMjAzIDE2OGgxMzhsLTEyIDQ2SDIxNmwtMTMtNDZaIiBmaWxsPSIjRkY4QTFGIi8+PHBhdGggZD0iTTIyMiAyMjNoNTJjMyAyNSAwIDUzLTkgODMiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIxMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTI5NCAyMjRjNiAzMyA2IDY3IDAgMTAxTTMyMCAyMjRjNSAzNCA1IDY4IDAgMTAxTTM0NSAyMjRjNCAzMiA0IDY1IDAgOTgiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIxMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTIwOSAzNTdjLTggMjQtMjAgNDMtMzkgNTdoMTUzYy0xNS0xMy0yNC0zMS0yNi01N0gyMDlaIiBmaWxsPSIjRkZGRkZGIi8+PC9zdmc+" alt="Sheikh Al Kar logo">\n        <h1>شيخ الكار</h1>\n        <p class="en center">Sheikh Al Kar</p>\n        <p>الفرع الرئيسي</p>\n        <p>Ramallah, Palestine</p>\n        \n        <p>الرقم الضريبي: <span dir="ltr">310048229</span></p>\n        \n      </header>\n      <section class="meta">\n        <div class="row"><span>الفاتورة</span><strong class="value invoice-number">#MAIN-REG-MAIN-01-2026-000025</strong></div>\n        <div class="row"><span>التاريخ</span><strong class="value ">19‏/7‏/2026</strong></div>\n        <div class="row"><span>الوقت</span><strong class="value ">11:17 م</strong></div>\n        <div class="row"><span>الموظف</span><strong class="value ">Omar Khalil</strong></div>\n        <div class="row"><span>الزبون</span><strong class="value ">test</strong></div>\n        <div class="row"><span>هاتف الزبون</span><strong class="value ">0598746584</strong></div>\n        <div class="row"><span>طريقة الدفع</span><strong class="value ">نقداً</strong></div>\n        <div class="row"><span>العملة</span><strong class="value ">ILS</strong></div>\n        <div class="row"><span>المدفوع</span><strong class="value ">ILS 36.90</strong></div>\n        <div class="row"><span>طريقة التسليم</span><strong class="value ">توصيل</strong></div>\n        <div class="row"><span>نوع الطلب</span><strong class="value ">توصيل</strong></div>\n        <div class="row"><span>ملاحظات</span><strong class="value ">test</strong></div>\n      </section>\n      <table><tbody>\n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>تيراميسو</strong>\n        \n        \n        \n        \n        <small>سعر الوحدة: ILS 5.00</small>\n      </td>\n      <td class="money">ILS 5.00</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>مارغريتا</strong>\n        \n        <small>وسط</small>\n        \n        \n        <small>سعر الوحدة: ILS 9.00</small>\n      </td>\n      <td class="money">ILS 9.00</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>بيبروني حار</strong>\n        \n        <small>وسط</small>\n        \n        \n        <small>سعر الوحدة: ILS 10.50</small>\n      </td>\n      <td class="money">ILS 10.50</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>سلطة حلوم</strong>\n        \n        \n        \n        \n        <small>سعر الوحدة: ILS 7.75</small>\n      </td>\n      <td class="money">ILS 7.75</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>فستق مثلج</strong>\n        \n        <small>عادي</small>\n        \n        \n        <small>سعر الوحدة: ILS 4.25</small>\n      </td>\n      <td class="money">ILS 4.25</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>بطاطا محملة</strong>\n        \n        <small>صغير</small>\n        \n        \n        <small>سعر الوحدة: ILS 4.50</small>\n      </td>\n      <td class="money">ILS 4.50</td>\n    </tr>\n  </tbody></table>\n      <section class="totals">\n        <div class="row "><span>المجموع</span><strong class="value">ILS 41.00</strong></div>\n        <div class="row "><span>الخصم</span><strong class="value">- ILS 4.10</strong></div>\n        \n        \n        \n        <div class="row strong"><span>الإجمالي</span><strong class="value">ILS 36.90</strong></div>\n        <div class="row "><span>المدفوع</span><strong class="value">ILS 36.90</strong></div>\n        \n      </section>\n      <footer>\n        <strong>شكراً لزيارتكم</strong>\n        <p>الأسعار تشمل الضريبة</p>\n        <p>الرقم الضريبي: <span dir="ltr">310048229</span></p>\n        <p class="invoice-number">cmrs8m6jt0001w89neogjma52</p>\n      </footer>\n    </main></body></html>	1	W80	\N	PRINTED	1	5	\N	\N	invoice:cmrs8m6jt0001w89neogjma52:receipt:cmrs4db040007cg9nzhr3t2fc	2026-07-19 20:17:38.085	2026-07-19 20:17:38.279	2026-07-19 20:17:39.322	2026-07-19 20:17:41.607	\N	\N	f	\N	\N	f
cmrs91t5p0001589n1xc2brc0	cmr97q88n0000rs9nh4sethxg	cmrs0kvf90002t89nnfc21r9f	cmrs4db040007cg9nzhr3t2fc	cmrs8m6jt0001w89neogjma52	\N	cmrs8m6n9000aw89np74vlf3c	CUSTOMER_RECEIPT	HTML	<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>\n    :root{--receipt-width:60mm}@page{size:60mm auto;margin:0}*{box-sizing:border-box}\n    body.receipt-document{width:var(--receipt-width);margin:0;padding:0;background:#fff;color:#000;overflow:visible;font-family:Arial,Tahoma,"Segoe UI",sans-serif}\n    .receipt{width:var(--receipt-width);min-width:var(--receipt-width);max-width:var(--receipt-width);padding:4mm;box-sizing:border-box;font-family:Arial,Tahoma,"Segoe UI",sans-serif;font-size:11px;line-height:1.35;color:#000;background:#fff;overflow:visible;height:auto;max-height:none}\n    .receipt .logo{width:17mm;height:17mm;object-fit:contain;display:block;margin:0 auto 2mm}.receipt h1{font-size:17px;margin:0 0 1mm;text-align:center}.receipt p{margin:0 0 1mm}.receipt header,.receipt footer{text-align:center}\n    .receipt .center{text-align:center}.receipt .en{direction:ltr}.receipt .meta,.receipt .totals{border-top:1px dashed #000;border-bottom:1px dashed #000;margin:3mm 0;padding:2mm 0}\n    .receipt .row{display:flex;justify-content:space-between;align-items:flex-start;gap:3mm;margin:1mm 0}.receipt .row span:first-child{flex:0 0 auto}.receipt .value{overflow-wrap:anywhere;word-break:break-word;text-align:end;max-width:45mm}\n    .receipt .invoice-number{max-width:100%;overflow-wrap:anywhere;word-break:break-word;white-space:normal;direction:ltr;text-align:left}\n    .receipt table{width:100%;border-collapse:collapse}.receipt td{padding:1.5mm 0;vertical-align:top;border-bottom:1px dotted #999}.receipt .qty{width:9mm;font-weight:bold}.receipt .item-name{overflow-wrap:anywhere;word-break:break-word}.receipt .money{text-align:end;white-space:nowrap}\n    .receipt small{display:block;color:#333;margin-top:1mm}.receipt .strong{font-size:14px;font-weight:bold}.receipt footer{margin-top:4mm;font-size:10px}\n  </style></head><body class="receipt receipt-document">\n    <main class="receipt">\n      <header>\n        <img class="logo" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3QgeD0iNTQiIHk9IjQ2IiB3aWR0aD0iNDA0IiBoZWlnaHQ9IjQyMCIgcng9Ijg2IiBmaWxsPSIjRjg2ODAwIi8+PHBhdGggZD0iTTEzNSAxMjhoMjQyYzIyIDAgNDAgMTggNDAgNDB2MTI4YzAgMzEtMjUgNTYtNTYgNTZoLTRjLTI3IDAtNDktMjItNDktNDl2LTg3SDIwNHY4N2MwIDI3LTIyIDQ5LTQ5IDQ5aC00Yy0zMSAwLTU2LTI1LTU2LTU2VjE2OGMwLTIyIDE4LTQwIDQwLTQwWiIgZmlsbD0iI0ZGRkZGRiIvPjxwYXRoIGQ9Ik0yMDkgMTc0aDExOGwtMjEgODZjLTUgMjEgMiA0MyAxOCA1OGwxMyAxMkgyMTBjMjgtMzAgNDEtNjUgMzktMTA1bC00MC01MVoiIGZpbGw9IiNGODY4MDAiLz48cGF0aCBkPSJNMjAzIDE2OGgxMzhsLTEyIDQ2SDIxNmwtMTMtNDZaIiBmaWxsPSIjRkY4QTFGIi8+PHBhdGggZD0iTTIyMiAyMjNoNTJjMyAyNSAwIDUzLTkgODMiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIxMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTI5NCAyMjRjNiAzMyA2IDY3IDAgMTAxTTMyMCAyMjRjNSAzNCA1IDY4IDAgMTAxTTM0NSAyMjRjNCAzMiA0IDY1IDAgOTgiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIxMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTIwOSAzNTdjLTggMjQtMjAgNDMtMzkgNTdoMTUzYy0xNS0xMy0yNC0zMS0yNi01N0gyMDlaIiBmaWxsPSIjRkZGRkZGIi8+PC9zdmc+" alt="Sheikh Al Kar logo">\n        <h1>شيخ الكار</h1>\n        <p class="en center">Sheikh Al Kar</p>\n        <p>الفرع الرئيسي</p>\n        <p>Ramallah, Palestine</p>\n        \n        <p>الرقم الضريبي: <span dir="ltr">310048229</span></p>\n        <p><strong>REPRINT / إعادة طباعة</strong></p>\n      </header>\n      <section class="meta">\n        <div class="row"><span>الفاتورة</span><strong class="value invoice-number">#MAIN-REG-MAIN-01-2026-000025</strong></div>\n        <div class="row"><span>التاريخ</span><strong class="value ">19‏/7‏/2026</strong></div>\n        <div class="row"><span>الوقت</span><strong class="value ">11:17 م</strong></div>\n        <div class="row"><span>الموظف</span><strong class="value ">Omar Khalil</strong></div>\n        <div class="row"><span>الزبون</span><strong class="value ">test</strong></div>\n        <div class="row"><span>هاتف الزبون</span><strong class="value ">0598746584</strong></div>\n        <div class="row"><span>طريقة الدفع</span><strong class="value ">نقداً</strong></div>\n        <div class="row"><span>العملة</span><strong class="value ">ILS</strong></div>\n        <div class="row"><span>المدفوع</span><strong class="value ">ILS 36.90</strong></div>\n        <div class="row"><span>طريقة التسليم</span><strong class="value ">توصيل</strong></div>\n        <div class="row"><span>نوع الطلب</span><strong class="value ">توصيل</strong></div>\n        <div class="row"><span>ملاحظات</span><strong class="value ">test</strong></div>\n      </section>\n      <table><tbody>\n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>تيراميسو</strong>\n        \n        \n        \n        \n        <small>سعر الوحدة: ILS 5.00</small>\n      </td>\n      <td class="money">ILS 5.00</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>مارغريتا</strong>\n        \n        <small>وسط</small>\n        \n        \n        <small>سعر الوحدة: ILS 9.00</small>\n      </td>\n      <td class="money">ILS 9.00</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>بيبروني حار</strong>\n        \n        <small>وسط</small>\n        \n        \n        <small>سعر الوحدة: ILS 10.50</small>\n      </td>\n      <td class="money">ILS 10.50</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>سلطة حلوم</strong>\n        \n        \n        \n        \n        <small>سعر الوحدة: ILS 7.75</small>\n      </td>\n      <td class="money">ILS 7.75</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>فستق مثلج</strong>\n        \n        <small>عادي</small>\n        \n        \n        <small>سعر الوحدة: ILS 4.25</small>\n      </td>\n      <td class="money">ILS 4.25</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>بطاطا محملة</strong>\n        \n        <small>صغير</small>\n        \n        \n        <small>سعر الوحدة: ILS 4.50</small>\n      </td>\n      <td class="money">ILS 4.50</td>\n    </tr>\n  </tbody></table>\n      <section class="totals">\n        <div class="row "><span>المجموع</span><strong class="value">ILS 41.00</strong></div>\n        <div class="row "><span>الخصم</span><strong class="value">- ILS 4.10</strong></div>\n        \n        \n        \n        <div class="row strong"><span>الإجمالي</span><strong class="value">ILS 36.90</strong></div>\n        <div class="row "><span>المدفوع</span><strong class="value">ILS 36.90</strong></div>\n        \n      </section>\n      <footer>\n        <strong>شكراً لزيارتكم</strong>\n        <p>الأسعار تشمل الضريبة</p>\n        <p>الرقم الضريبي: <span dir="ltr">310048229</span></p>\n        <p class="invoice-number">cmrs8m6jt0001w89neogjma52</p>\n      </footer>\n    </main></body></html>	1	W80	\N	PRINTED	1	5	\N	\N	invoice:cmrs8m6jt0001w89neogjma52:receipt:reprint:1784492987098	2026-07-19 20:29:47.101	2026-07-19 21:01:09.049	2026-07-19 21:01:12.795	2026-07-19 21:01:14.081	\N	\N	f	\N	\N	f
cmrs93n1p0003589ngfk0twx7	cmr97q88n0000rs9nh4sethxg	cmrs0kvf90002t89nnfc21r9f	cmrs4db040007cg9nzhr3t2fc	cmrs8m6jt0001w89neogjma52	\N	cmrs8m6n9000aw89np74vlf3c	CUSTOMER_RECEIPT	HTML	<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>\n    :root{--receipt-width:60mm}@page{size:60mm auto;margin:0}*{box-sizing:border-box}\n    body.receipt-document{width:var(--receipt-width);margin:0;padding:0;background:#fff;color:#000;overflow:visible;font-family:Arial,Tahoma,"Segoe UI",sans-serif}\n    .receipt{width:var(--receipt-width);min-width:var(--receipt-width);max-width:var(--receipt-width);padding:4mm;box-sizing:border-box;font-family:Arial,Tahoma,"Segoe UI",sans-serif;font-size:11px;line-height:1.35;color:#000;background:#fff;overflow:visible;height:auto;max-height:none}\n    .receipt .logo{width:17mm;height:17mm;object-fit:contain;display:block;margin:0 auto 2mm}.receipt h1{font-size:17px;margin:0 0 1mm;text-align:center}.receipt p{margin:0 0 1mm}.receipt header,.receipt footer{text-align:center}\n    .receipt .center{text-align:center}.receipt .en{direction:ltr}.receipt .meta,.receipt .totals{border-top:1px dashed #000;border-bottom:1px dashed #000;margin:3mm 0;padding:2mm 0}\n    .receipt .row{display:flex;justify-content:space-between;align-items:flex-start;gap:3mm;margin:1mm 0}.receipt .row span:first-child{flex:0 0 auto}.receipt .value{overflow-wrap:anywhere;word-break:break-word;text-align:end;max-width:45mm}\n    .receipt .invoice-number{max-width:100%;overflow-wrap:anywhere;word-break:break-word;white-space:normal;direction:ltr;text-align:left}\n    .receipt table{width:100%;border-collapse:collapse}.receipt td{padding:1.5mm 0;vertical-align:top;border-bottom:1px dotted #999}.receipt .qty{width:9mm;font-weight:bold}.receipt .item-name{overflow-wrap:anywhere;word-break:break-word}.receipt .money{text-align:end;white-space:nowrap}\n    .receipt small{display:block;color:#333;margin-top:1mm}.receipt .strong{font-size:14px;font-weight:bold}.receipt footer{margin-top:4mm;font-size:10px}\n  </style></head><body class="receipt receipt-document">\n    <main class="receipt">\n      <header>\n        <img class="logo" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3QgeD0iNTQiIHk9IjQ2IiB3aWR0aD0iNDA0IiBoZWlnaHQ9IjQyMCIgcng9Ijg2IiBmaWxsPSIjRjg2ODAwIi8+PHBhdGggZD0iTTEzNSAxMjhoMjQyYzIyIDAgNDAgMTggNDAgNDB2MTI4YzAgMzEtMjUgNTYtNTYgNTZoLTRjLTI3IDAtNDktMjItNDktNDl2LTg3SDIwNHY4N2MwIDI3LTIyIDQ5LTQ5IDQ5aC00Yy0zMSAwLTU2LTI1LTU2LTU2VjE2OGMwLTIyIDE4LTQwIDQwLTQwWiIgZmlsbD0iI0ZGRkZGRiIvPjxwYXRoIGQ9Ik0yMDkgMTc0aDExOGwtMjEgODZjLTUgMjEgMiA0MyAxOCA1OGwxMyAxMkgyMTBjMjgtMzAgNDEtNjUgMzktMTA1bC00MC01MVoiIGZpbGw9IiNGODY4MDAiLz48cGF0aCBkPSJNMjAzIDE2OGgxMzhsLTEyIDQ2SDIxNmwtMTMtNDZaIiBmaWxsPSIjRkY4QTFGIi8+PHBhdGggZD0iTTIyMiAyMjNoNTJjMyAyNSAwIDUzLTkgODMiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIxMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTI5NCAyMjRjNiAzMyA2IDY3IDAgMTAxTTMyMCAyMjRjNSAzNCA1IDY4IDAgMTAxTTM0NSAyMjRjNCAzMiA0IDY1IDAgOTgiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIxMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTIwOSAzNTdjLTggMjQtMjAgNDMtMzkgNTdoMTUzYy0xNS0xMy0yNC0zMS0yNi01N0gyMDlaIiBmaWxsPSIjRkZGRkZGIi8+PC9zdmc+" alt="Sheikh Al Kar logo">\n        <h1>شيخ الكار</h1>\n        <p class="en center">Sheikh Al Kar</p>\n        <p>الفرع الرئيسي</p>\n        <p>Ramallah, Palestine</p>\n        \n        <p>الرقم الضريبي: <span dir="ltr">310048229</span></p>\n        <p><strong>REPRINT / إعادة طباعة</strong></p>\n      </header>\n      <section class="meta">\n        <div class="row"><span>الفاتورة</span><strong class="value invoice-number">#MAIN-REG-MAIN-01-2026-000025</strong></div>\n        <div class="row"><span>التاريخ</span><strong class="value ">19‏/7‏/2026</strong></div>\n        <div class="row"><span>الوقت</span><strong class="value ">11:17 م</strong></div>\n        <div class="row"><span>الموظف</span><strong class="value ">Omar Khalil</strong></div>\n        <div class="row"><span>الزبون</span><strong class="value ">test</strong></div>\n        <div class="row"><span>هاتف الزبون</span><strong class="value ">0598746584</strong></div>\n        <div class="row"><span>طريقة الدفع</span><strong class="value ">نقداً</strong></div>\n        <div class="row"><span>العملة</span><strong class="value ">ILS</strong></div>\n        <div class="row"><span>المدفوع</span><strong class="value ">ILS 36.90</strong></div>\n        <div class="row"><span>طريقة التسليم</span><strong class="value ">توصيل</strong></div>\n        <div class="row"><span>نوع الطلب</span><strong class="value ">توصيل</strong></div>\n        <div class="row"><span>ملاحظات</span><strong class="value ">test</strong></div>\n      </section>\n      <table><tbody>\n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>تيراميسو</strong>\n        \n        \n        \n        \n        <small>سعر الوحدة: ILS 5.00</small>\n      </td>\n      <td class="money">ILS 5.00</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>مارغريتا</strong>\n        \n        <small>وسط</small>\n        \n        \n        <small>سعر الوحدة: ILS 9.00</small>\n      </td>\n      <td class="money">ILS 9.00</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>بيبروني حار</strong>\n        \n        <small>وسط</small>\n        \n        \n        <small>سعر الوحدة: ILS 10.50</small>\n      </td>\n      <td class="money">ILS 10.50</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>سلطة حلوم</strong>\n        \n        \n        \n        \n        <small>سعر الوحدة: ILS 7.75</small>\n      </td>\n      <td class="money">ILS 7.75</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>فستق مثلج</strong>\n        \n        <small>عادي</small>\n        \n        \n        <small>سعر الوحدة: ILS 4.25</small>\n      </td>\n      <td class="money">ILS 4.25</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>بطاطا محملة</strong>\n        \n        <small>صغير</small>\n        \n        \n        <small>سعر الوحدة: ILS 4.50</small>\n      </td>\n      <td class="money">ILS 4.50</td>\n    </tr>\n  </tbody></table>\n      <section class="totals">\n        <div class="row "><span>المجموع</span><strong class="value">ILS 41.00</strong></div>\n        <div class="row "><span>الخصم</span><strong class="value">- ILS 4.10</strong></div>\n        \n        \n        \n        <div class="row strong"><span>الإجمالي</span><strong class="value">ILS 36.90</strong></div>\n        <div class="row "><span>المدفوع</span><strong class="value">ILS 36.90</strong></div>\n        \n      </section>\n      <footer>\n        <strong>شكراً لزيارتكم</strong>\n        <p>الأسعار تشمل الضريبة</p>\n        <p>الرقم الضريبي: <span dir="ltr">310048229</span></p>\n        <p class="invoice-number">cmrs8m6jt0001w89neogjma52</p>\n      </footer>\n    </main></body></html>	1	W80	\N	PRINTED	1	5	\N	\N	invoice:cmrs8m6jt0001w89neogjma52:receipt:reprint:1784493072490	2026-07-19 20:31:12.494	2026-07-19 21:01:09.056	2026-07-19 21:01:15.612	2026-07-19 21:01:16.996	\N	\N	f	\N	\N	f
cmrs93twy0004589norxr6ee0	cmr97q88n0000rs9nh4sethxg	cmrs0kvf90002t89nnfc21r9f	cmrs4db040007cg9nzhr3t2fc	cmrs8m6jt0001w89neogjma52	\N	cmrs8m6n9000aw89np74vlf3c	CUSTOMER_RECEIPT	HTML	<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>\n    :root{--receipt-width:60mm}@page{size:60mm auto;margin:0}*{box-sizing:border-box}\n    body.receipt-document{width:var(--receipt-width);margin:0;padding:0;background:#fff;color:#000;overflow:visible;font-family:Arial,Tahoma,"Segoe UI",sans-serif}\n    .receipt{width:var(--receipt-width);min-width:var(--receipt-width);max-width:var(--receipt-width);padding:4mm;box-sizing:border-box;font-family:Arial,Tahoma,"Segoe UI",sans-serif;font-size:11px;line-height:1.35;color:#000;background:#fff;overflow:visible;height:auto;max-height:none}\n    .receipt .logo{width:17mm;height:17mm;object-fit:contain;display:block;margin:0 auto 2mm}.receipt h1{font-size:17px;margin:0 0 1mm;text-align:center}.receipt p{margin:0 0 1mm}.receipt header,.receipt footer{text-align:center}\n    .receipt .center{text-align:center}.receipt .en{direction:ltr}.receipt .meta,.receipt .totals{border-top:1px dashed #000;border-bottom:1px dashed #000;margin:3mm 0;padding:2mm 0}\n    .receipt .row{display:flex;justify-content:space-between;align-items:flex-start;gap:3mm;margin:1mm 0}.receipt .row span:first-child{flex:0 0 auto}.receipt .value{overflow-wrap:anywhere;word-break:break-word;text-align:end;max-width:45mm}\n    .receipt .invoice-number{max-width:100%;overflow-wrap:anywhere;word-break:break-word;white-space:normal;direction:ltr;text-align:left}\n    .receipt table{width:100%;border-collapse:collapse}.receipt td{padding:1.5mm 0;vertical-align:top;border-bottom:1px dotted #999}.receipt .qty{width:9mm;font-weight:bold}.receipt .item-name{overflow-wrap:anywhere;word-break:break-word}.receipt .money{text-align:end;white-space:nowrap}\n    .receipt small{display:block;color:#333;margin-top:1mm}.receipt .strong{font-size:14px;font-weight:bold}.receipt footer{margin-top:4mm;font-size:10px}\n  </style></head><body class="receipt receipt-document">\n    <main class="receipt">\n      <header>\n        <img class="logo" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3QgeD0iNTQiIHk9IjQ2IiB3aWR0aD0iNDA0IiBoZWlnaHQ9IjQyMCIgcng9Ijg2IiBmaWxsPSIjRjg2ODAwIi8+PHBhdGggZD0iTTEzNSAxMjhoMjQyYzIyIDAgNDAgMTggNDAgNDB2MTI4YzAgMzEtMjUgNTYtNTYgNTZoLTRjLTI3IDAtNDktMjItNDktNDl2LTg3SDIwNHY4N2MwIDI3LTIyIDQ5LTQ5IDQ5aC00Yy0zMSAwLTU2LTI1LTU2LTU2VjE2OGMwLTIyIDE4LTQwIDQwLTQwWiIgZmlsbD0iI0ZGRkZGRiIvPjxwYXRoIGQ9Ik0yMDkgMTc0aDExOGwtMjEgODZjLTUgMjEgMiA0MyAxOCA1OGwxMyAxMkgyMTBjMjgtMzAgNDEtNjUgMzktMTA1bC00MC01MVoiIGZpbGw9IiNGODY4MDAiLz48cGF0aCBkPSJNMjAzIDE2OGgxMzhsLTEyIDQ2SDIxNmwtMTMtNDZaIiBmaWxsPSIjRkY4QTFGIi8+PHBhdGggZD0iTTIyMiAyMjNoNTJjMyAyNSAwIDUzLTkgODMiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIxMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTI5NCAyMjRjNiAzMyA2IDY3IDAgMTAxTTMyMCAyMjRjNSAzNCA1IDY4IDAgMTAxTTM0NSAyMjRjNCAzMiA0IDY1IDAgOTgiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIxMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTIwOSAzNTdjLTggMjQtMjAgNDMtMzkgNTdoMTUzYy0xNS0xMy0yNC0zMS0yNi01N0gyMDlaIiBmaWxsPSIjRkZGRkZGIi8+PC9zdmc+" alt="Sheikh Al Kar logo">\n        <h1>شيخ الكار</h1>\n        <p class="en center">Sheikh Al Kar</p>\n        <p>الفرع الرئيسي</p>\n        <p>Ramallah, Palestine</p>\n        \n        <p>الرقم الضريبي: <span dir="ltr">310048229</span></p>\n        <p><strong>REPRINT / إعادة طباعة</strong></p>\n      </header>\n      <section class="meta">\n        <div class="row"><span>الفاتورة</span><strong class="value invoice-number">#MAIN-REG-MAIN-01-2026-000025</strong></div>\n        <div class="row"><span>التاريخ</span><strong class="value ">19‏/7‏/2026</strong></div>\n        <div class="row"><span>الوقت</span><strong class="value ">11:17 م</strong></div>\n        <div class="row"><span>الموظف</span><strong class="value ">Omar Khalil</strong></div>\n        <div class="row"><span>الزبون</span><strong class="value ">test</strong></div>\n        <div class="row"><span>هاتف الزبون</span><strong class="value ">0598746584</strong></div>\n        <div class="row"><span>طريقة الدفع</span><strong class="value ">نقداً</strong></div>\n        <div class="row"><span>العملة</span><strong class="value ">ILS</strong></div>\n        <div class="row"><span>المدفوع</span><strong class="value ">ILS 36.90</strong></div>\n        <div class="row"><span>طريقة التسليم</span><strong class="value ">توصيل</strong></div>\n        <div class="row"><span>نوع الطلب</span><strong class="value ">توصيل</strong></div>\n        <div class="row"><span>ملاحظات</span><strong class="value ">test</strong></div>\n      </section>\n      <table><tbody>\n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>تيراميسو</strong>\n        \n        \n        \n        \n        <small>سعر الوحدة: ILS 5.00</small>\n      </td>\n      <td class="money">ILS 5.00</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>مارغريتا</strong>\n        \n        <small>وسط</small>\n        \n        \n        <small>سعر الوحدة: ILS 9.00</small>\n      </td>\n      <td class="money">ILS 9.00</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>بيبروني حار</strong>\n        \n        <small>وسط</small>\n        \n        \n        <small>سعر الوحدة: ILS 10.50</small>\n      </td>\n      <td class="money">ILS 10.50</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>سلطة حلوم</strong>\n        \n        \n        \n        \n        <small>سعر الوحدة: ILS 7.75</small>\n      </td>\n      <td class="money">ILS 7.75</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>فستق مثلج</strong>\n        \n        <small>عادي</small>\n        \n        \n        <small>سعر الوحدة: ILS 4.25</small>\n      </td>\n      <td class="money">ILS 4.25</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>بطاطا محملة</strong>\n        \n        <small>صغير</small>\n        \n        \n        <small>سعر الوحدة: ILS 4.50</small>\n      </td>\n      <td class="money">ILS 4.50</td>\n    </tr>\n  </tbody></table>\n      <section class="totals">\n        <div class="row "><span>المجموع</span><strong class="value">ILS 41.00</strong></div>\n        <div class="row "><span>الخصم</span><strong class="value">- ILS 4.10</strong></div>\n        \n        \n        \n        <div class="row strong"><span>الإجمالي</span><strong class="value">ILS 36.90</strong></div>\n        <div class="row "><span>المدفوع</span><strong class="value">ILS 36.90</strong></div>\n        \n      </section>\n      <footer>\n        <strong>شكراً لزيارتكم</strong>\n        <p>الأسعار تشمل الضريبة</p>\n        <p>الرقم الضريبي: <span dir="ltr">310048229</span></p>\n        <p class="invoice-number">cmrs8m6jt0001w89neogjma52</p>\n      </footer>\n    </main></body></html>	1	W80	\N	PRINTED	1	5	\N	\N	invoice:cmrs8m6jt0001w89neogjma52:receipt:reprint:1784493081392	2026-07-19 20:31:21.394	2026-07-19 21:01:09.059	2026-07-19 21:01:17.127	2026-07-19 21:01:18.44	\N	\N	f	\N	\N	f
cmrs951yp0005589n1y9knxfd	cmr97q88n0000rs9nh4sethxg	cmrs0kvf90002t89nnfc21r9f	cmrs4db040007cg9nzhr3t2fc	cmrs8m6jt0001w89neogjma52	\N	cmrs8m6n9000aw89np74vlf3c	CUSTOMER_RECEIPT	HTML	<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>\n    :root{--receipt-width:60mm}@page{size:60mm auto;margin:0}*{box-sizing:border-box}\n    body.receipt-document{width:var(--receipt-width);margin:0;padding:0;background:#fff;color:#000;overflow:visible;font-family:Arial,Tahoma,"Segoe UI",sans-serif}\n    .receipt{width:var(--receipt-width);min-width:var(--receipt-width);max-width:var(--receipt-width);padding:4mm;box-sizing:border-box;font-family:Arial,Tahoma,"Segoe UI",sans-serif;font-size:11px;line-height:1.35;color:#000;background:#fff;overflow:visible;height:auto;max-height:none}\n    .receipt .logo{width:17mm;height:17mm;object-fit:contain;display:block;margin:0 auto 2mm}.receipt h1{font-size:17px;margin:0 0 1mm;text-align:center}.receipt p{margin:0 0 1mm}.receipt header,.receipt footer{text-align:center}\n    .receipt .center{text-align:center}.receipt .en{direction:ltr}.receipt .meta,.receipt .totals{border-top:1px dashed #000;border-bottom:1px dashed #000;margin:3mm 0;padding:2mm 0}\n    .receipt .row{display:flex;justify-content:space-between;align-items:flex-start;gap:3mm;margin:1mm 0}.receipt .row span:first-child{flex:0 0 auto}.receipt .value{overflow-wrap:anywhere;word-break:break-word;text-align:end;max-width:45mm}\n    .receipt .invoice-number{max-width:100%;overflow-wrap:anywhere;word-break:break-word;white-space:normal;direction:ltr;text-align:left}\n    .receipt table{width:100%;border-collapse:collapse}.receipt td{padding:1.5mm 0;vertical-align:top;border-bottom:1px dotted #999}.receipt .qty{width:9mm;font-weight:bold}.receipt .item-name{overflow-wrap:anywhere;word-break:break-word}.receipt .money{text-align:end;white-space:nowrap}\n    .receipt small{display:block;color:#333;margin-top:1mm}.receipt .strong{font-size:14px;font-weight:bold}.receipt footer{margin-top:4mm;font-size:10px}\n  </style></head><body class="receipt receipt-document">\n    <main class="receipt">\n      <header>\n        <img class="logo" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3QgeD0iNTQiIHk9IjQ2IiB3aWR0aD0iNDA0IiBoZWlnaHQ9IjQyMCIgcng9Ijg2IiBmaWxsPSIjRjg2ODAwIi8+PHBhdGggZD0iTTEzNSAxMjhoMjQyYzIyIDAgNDAgMTggNDAgNDB2MTI4YzAgMzEtMjUgNTYtNTYgNTZoLTRjLTI3IDAtNDktMjItNDktNDl2LTg3SDIwNHY4N2MwIDI3LTIyIDQ5LTQ5IDQ5aC00Yy0zMSAwLTU2LTI1LTU2LTU2VjE2OGMwLTIyIDE4LTQwIDQwLTQwWiIgZmlsbD0iI0ZGRkZGRiIvPjxwYXRoIGQ9Ik0yMDkgMTc0aDExOGwtMjEgODZjLTUgMjEgMiA0MyAxOCA1OGwxMyAxMkgyMTBjMjgtMzAgNDEtNjUgMzktMTA1bC00MC01MVoiIGZpbGw9IiNGODY4MDAiLz48cGF0aCBkPSJNMjAzIDE2OGgxMzhsLTEyIDQ2SDIxNmwtMTMtNDZaIiBmaWxsPSIjRkY4QTFGIi8+PHBhdGggZD0iTTIyMiAyMjNoNTJjMyAyNSAwIDUzLTkgODMiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIxMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTI5NCAyMjRjNiAzMyA2IDY3IDAgMTAxTTMyMCAyMjRjNSAzNCA1IDY4IDAgMTAxTTM0NSAyMjRjNCAzMiA0IDY1IDAgOTgiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIxMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTIwOSAzNTdjLTggMjQtMjAgNDMtMzkgNTdoMTUzYy0xNS0xMy0yNC0zMS0yNi01N0gyMDlaIiBmaWxsPSIjRkZGRkZGIi8+PC9zdmc+" alt="Sheikh Al Kar logo">\n        <h1>شيخ الكار</h1>\n        <p class="en center">Sheikh Al Kar</p>\n        <p>الفرع الرئيسي</p>\n        <p>Ramallah, Palestine</p>\n        \n        <p>الرقم الضريبي: <span dir="ltr">310048229</span></p>\n        <p><strong>REPRINT / إعادة طباعة</strong></p>\n      </header>\n      <section class="meta">\n        <div class="row"><span>الفاتورة</span><strong class="value invoice-number">#MAIN-REG-MAIN-01-2026-000025</strong></div>\n        <div class="row"><span>التاريخ</span><strong class="value ">19‏/7‏/2026</strong></div>\n        <div class="row"><span>الوقت</span><strong class="value ">11:17 م</strong></div>\n        <div class="row"><span>الموظف</span><strong class="value ">Omar Khalil</strong></div>\n        <div class="row"><span>الزبون</span><strong class="value ">test</strong></div>\n        <div class="row"><span>هاتف الزبون</span><strong class="value ">0598746584</strong></div>\n        <div class="row"><span>طريقة الدفع</span><strong class="value ">نقداً</strong></div>\n        <div class="row"><span>العملة</span><strong class="value ">ILS</strong></div>\n        <div class="row"><span>المدفوع</span><strong class="value ">ILS 36.90</strong></div>\n        <div class="row"><span>طريقة التسليم</span><strong class="value ">توصيل</strong></div>\n        <div class="row"><span>نوع الطلب</span><strong class="value ">توصيل</strong></div>\n        <div class="row"><span>ملاحظات</span><strong class="value ">test</strong></div>\n      </section>\n      <table><tbody>\n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>تيراميسو</strong>\n        \n        \n        \n        \n        <small>سعر الوحدة: ILS 5.00</small>\n      </td>\n      <td class="money">ILS 5.00</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>مارغريتا</strong>\n        \n        <small>وسط</small>\n        \n        \n        <small>سعر الوحدة: ILS 9.00</small>\n      </td>\n      <td class="money">ILS 9.00</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>بيبروني حار</strong>\n        \n        <small>وسط</small>\n        \n        \n        <small>سعر الوحدة: ILS 10.50</small>\n      </td>\n      <td class="money">ILS 10.50</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>سلطة حلوم</strong>\n        \n        \n        \n        \n        <small>سعر الوحدة: ILS 7.75</small>\n      </td>\n      <td class="money">ILS 7.75</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>فستق مثلج</strong>\n        \n        <small>عادي</small>\n        \n        \n        <small>سعر الوحدة: ILS 4.25</small>\n      </td>\n      <td class="money">ILS 4.25</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>بطاطا محملة</strong>\n        \n        <small>صغير</small>\n        \n        \n        <small>سعر الوحدة: ILS 4.50</small>\n      </td>\n      <td class="money">ILS 4.50</td>\n    </tr>\n  </tbody></table>\n      <section class="totals">\n        <div class="row "><span>المجموع</span><strong class="value">ILS 41.00</strong></div>\n        <div class="row "><span>الخصم</span><strong class="value">- ILS 4.10</strong></div>\n        \n        \n        \n        <div class="row strong"><span>الإجمالي</span><strong class="value">ILS 36.90</strong></div>\n        <div class="row "><span>المدفوع</span><strong class="value">ILS 36.90</strong></div>\n        \n      </section>\n      <footer>\n        <strong>شكراً لزيارتكم</strong>\n        <p>الأسعار تشمل الضريبة</p>\n        <p>الرقم الضريبي: <span dir="ltr">310048229</span></p>\n        <p class="invoice-number">cmrs8m6jt0001w89neogjma52</p>\n      </footer>\n    </main></body></html>	1	W80	\N	PRINTED	1	5	\N	\N	invoice:cmrs8m6jt0001w89neogjma52:receipt:reprint:1784493138478	2026-07-19 20:32:18.481	2026-07-19 21:01:09.062	2026-07-19 21:01:18.572	2026-07-19 21:01:19.847	\N	\N	f	\N	\N	f
cmrs958g10006589n5u7dunze	cmr97q88n0000rs9nh4sethxg	cmrs0kvf90002t89nnfc21r9f	cmrs4db040007cg9nzhr3t2fc	cmrs8m6jt0001w89neogjma52	\N	cmrs8m6n9000aw89np74vlf3c	CUSTOMER_RECEIPT	HTML	<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>\n    :root{--receipt-width:60mm}@page{size:60mm auto;margin:0}*{box-sizing:border-box}\n    body.receipt-document{width:var(--receipt-width);margin:0;padding:0;background:#fff;color:#000;overflow:visible;font-family:Arial,Tahoma,"Segoe UI",sans-serif}\n    .receipt{width:var(--receipt-width);min-width:var(--receipt-width);max-width:var(--receipt-width);padding:4mm;box-sizing:border-box;font-family:Arial,Tahoma,"Segoe UI",sans-serif;font-size:11px;line-height:1.35;color:#000;background:#fff;overflow:visible;height:auto;max-height:none}\n    .receipt .logo{width:17mm;height:17mm;object-fit:contain;display:block;margin:0 auto 2mm}.receipt h1{font-size:17px;margin:0 0 1mm;text-align:center}.receipt p{margin:0 0 1mm}.receipt header,.receipt footer{text-align:center}\n    .receipt .center{text-align:center}.receipt .en{direction:ltr}.receipt .meta,.receipt .totals{border-top:1px dashed #000;border-bottom:1px dashed #000;margin:3mm 0;padding:2mm 0}\n    .receipt .row{display:flex;justify-content:space-between;align-items:flex-start;gap:3mm;margin:1mm 0}.receipt .row span:first-child{flex:0 0 auto}.receipt .value{overflow-wrap:anywhere;word-break:break-word;text-align:end;max-width:45mm}\n    .receipt .invoice-number{max-width:100%;overflow-wrap:anywhere;word-break:break-word;white-space:normal;direction:ltr;text-align:left}\n    .receipt table{width:100%;border-collapse:collapse}.receipt td{padding:1.5mm 0;vertical-align:top;border-bottom:1px dotted #999}.receipt .qty{width:9mm;font-weight:bold}.receipt .item-name{overflow-wrap:anywhere;word-break:break-word}.receipt .money{text-align:end;white-space:nowrap}\n    .receipt small{display:block;color:#333;margin-top:1mm}.receipt .strong{font-size:14px;font-weight:bold}.receipt footer{margin-top:4mm;font-size:10px}\n  </style></head><body class="receipt receipt-document">\n    <main class="receipt">\n      <header>\n        <img class="logo" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3QgeD0iNTQiIHk9IjQ2IiB3aWR0aD0iNDA0IiBoZWlnaHQ9IjQyMCIgcng9Ijg2IiBmaWxsPSIjRjg2ODAwIi8+PHBhdGggZD0iTTEzNSAxMjhoMjQyYzIyIDAgNDAgMTggNDAgNDB2MTI4YzAgMzEtMjUgNTYtNTYgNTZoLTRjLTI3IDAtNDktMjItNDktNDl2LTg3SDIwNHY4N2MwIDI3LTIyIDQ5LTQ5IDQ5aC00Yy0zMSAwLTU2LTI1LTU2LTU2VjE2OGMwLTIyIDE4LTQwIDQwLTQwWiIgZmlsbD0iI0ZGRkZGRiIvPjxwYXRoIGQ9Ik0yMDkgMTc0aDExOGwtMjEgODZjLTUgMjEgMiA0MyAxOCA1OGwxMyAxMkgyMTBjMjgtMzAgNDEtNjUgMzktMTA1bC00MC01MVoiIGZpbGw9IiNGODY4MDAiLz48cGF0aCBkPSJNMjAzIDE2OGgxMzhsLTEyIDQ2SDIxNmwtMTMtNDZaIiBmaWxsPSIjRkY4QTFGIi8+PHBhdGggZD0iTTIyMiAyMjNoNTJjMyAyNSAwIDUzLTkgODMiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIxMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTI5NCAyMjRjNiAzMyA2IDY3IDAgMTAxTTMyMCAyMjRjNSAzNCA1IDY4IDAgMTAxTTM0NSAyMjRjNCAzMiA0IDY1IDAgOTgiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIxMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTIwOSAzNTdjLTggMjQtMjAgNDMtMzkgNTdoMTUzYy0xNS0xMy0yNC0zMS0yNi01N0gyMDlaIiBmaWxsPSIjRkZGRkZGIi8+PC9zdmc+" alt="Sheikh Al Kar logo">\n        <h1>شيخ الكار</h1>\n        <p class="en center">Sheikh Al Kar</p>\n        <p>الفرع الرئيسي</p>\n        <p>Ramallah, Palestine</p>\n        \n        <p>الرقم الضريبي: <span dir="ltr">310048229</span></p>\n        <p><strong>REPRINT / إعادة طباعة</strong></p>\n      </header>\n      <section class="meta">\n        <div class="row"><span>الفاتورة</span><strong class="value invoice-number">#MAIN-REG-MAIN-01-2026-000025</strong></div>\n        <div class="row"><span>التاريخ</span><strong class="value ">19‏/7‏/2026</strong></div>\n        <div class="row"><span>الوقت</span><strong class="value ">11:17 م</strong></div>\n        <div class="row"><span>الموظف</span><strong class="value ">Omar Khalil</strong></div>\n        <div class="row"><span>الزبون</span><strong class="value ">test</strong></div>\n        <div class="row"><span>هاتف الزبون</span><strong class="value ">0598746584</strong></div>\n        <div class="row"><span>طريقة الدفع</span><strong class="value ">نقداً</strong></div>\n        <div class="row"><span>العملة</span><strong class="value ">ILS</strong></div>\n        <div class="row"><span>المدفوع</span><strong class="value ">ILS 36.90</strong></div>\n        <div class="row"><span>طريقة التسليم</span><strong class="value ">توصيل</strong></div>\n        <div class="row"><span>نوع الطلب</span><strong class="value ">توصيل</strong></div>\n        <div class="row"><span>ملاحظات</span><strong class="value ">test</strong></div>\n      </section>\n      <table><tbody>\n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>تيراميسو</strong>\n        \n        \n        \n        \n        <small>سعر الوحدة: ILS 5.00</small>\n      </td>\n      <td class="money">ILS 5.00</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>مارغريتا</strong>\n        \n        <small>وسط</small>\n        \n        \n        <small>سعر الوحدة: ILS 9.00</small>\n      </td>\n      <td class="money">ILS 9.00</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>بيبروني حار</strong>\n        \n        <small>وسط</small>\n        \n        \n        <small>سعر الوحدة: ILS 10.50</small>\n      </td>\n      <td class="money">ILS 10.50</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>سلطة حلوم</strong>\n        \n        \n        \n        \n        <small>سعر الوحدة: ILS 7.75</small>\n      </td>\n      <td class="money">ILS 7.75</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>فستق مثلج</strong>\n        \n        <small>عادي</small>\n        \n        \n        <small>سعر الوحدة: ILS 4.25</small>\n      </td>\n      <td class="money">ILS 4.25</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>بطاطا محملة</strong>\n        \n        <small>صغير</small>\n        \n        \n        <small>سعر الوحدة: ILS 4.50</small>\n      </td>\n      <td class="money">ILS 4.50</td>\n    </tr>\n  </tbody></table>\n      <section class="totals">\n        <div class="row "><span>المجموع</span><strong class="value">ILS 41.00</strong></div>\n        <div class="row "><span>الخصم</span><strong class="value">- ILS 4.10</strong></div>\n        \n        \n        \n        <div class="row strong"><span>الإجمالي</span><strong class="value">ILS 36.90</strong></div>\n        <div class="row "><span>المدفوع</span><strong class="value">ILS 36.90</strong></div>\n        \n      </section>\n      <footer>\n        <strong>شكراً لزيارتكم</strong>\n        <p>الأسعار تشمل الضريبة</p>\n        <p>الرقم الضريبي: <span dir="ltr">310048229</span></p>\n        <p class="invoice-number">cmrs8m6jt0001w89neogjma52</p>\n      </footer>\n    </main></body></html>	1	W80	\N	PRINTED	1	5	\N	\N	invoice:cmrs8m6jt0001w89neogjma52:receipt:reprint:1784493146879	2026-07-19 20:32:26.881	2026-07-19 21:01:09.066	2026-07-19 21:01:20.064	2026-07-19 21:01:21.387	\N	\N	f	\N	\N	f
cmrs96p280007589nmpiueekb	cmr97q88n0000rs9nh4sethxg	cmrs0kvf90002t89nnfc21r9f	cmrs4db040007cg9nzhr3t2fc	cmrs8m6jt0001w89neogjma52	\N	cmrs8m6n9000aw89np74vlf3c	CUSTOMER_RECEIPT	HTML	<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>\n    :root{--receipt-width:60mm}@page{size:60mm auto;margin:0}*{box-sizing:border-box}\n    body.receipt-document{width:var(--receipt-width);margin:0;padding:0;background:#fff;color:#000;overflow:visible;font-family:Arial,Tahoma,"Segoe UI",sans-serif}\n    .receipt{width:var(--receipt-width);min-width:var(--receipt-width);max-width:var(--receipt-width);padding:4mm;box-sizing:border-box;font-family:Arial,Tahoma,"Segoe UI",sans-serif;font-size:11px;line-height:1.35;color:#000;background:#fff;overflow:visible;height:auto;max-height:none}\n    .receipt .logo{width:17mm;height:17mm;object-fit:contain;display:block;margin:0 auto 2mm}.receipt h1{font-size:17px;margin:0 0 1mm;text-align:center}.receipt p{margin:0 0 1mm}.receipt header,.receipt footer{text-align:center}\n    .receipt .center{text-align:center}.receipt .en{direction:ltr}.receipt .meta,.receipt .totals{border-top:1px dashed #000;border-bottom:1px dashed #000;margin:3mm 0;padding:2mm 0}\n    .receipt .row{display:flex;justify-content:space-between;align-items:flex-start;gap:3mm;margin:1mm 0}.receipt .row span:first-child{flex:0 0 auto}.receipt .value{overflow-wrap:anywhere;word-break:break-word;text-align:end;max-width:45mm}\n    .receipt .invoice-number{max-width:100%;overflow-wrap:anywhere;word-break:break-word;white-space:normal;direction:ltr;text-align:left}\n    .receipt table{width:100%;border-collapse:collapse}.receipt td{padding:1.5mm 0;vertical-align:top;border-bottom:1px dotted #999}.receipt .qty{width:9mm;font-weight:bold}.receipt .item-name{overflow-wrap:anywhere;word-break:break-word}.receipt .money{text-align:end;white-space:nowrap}\n    .receipt small{display:block;color:#333;margin-top:1mm}.receipt .strong{font-size:14px;font-weight:bold}.receipt footer{margin-top:4mm;font-size:10px}\n  </style></head><body class="receipt receipt-document">\n    <main class="receipt">\n      <header>\n        <img class="logo" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3QgeD0iNTQiIHk9IjQ2IiB3aWR0aD0iNDA0IiBoZWlnaHQ9IjQyMCIgcng9Ijg2IiBmaWxsPSIjRjg2ODAwIi8+PHBhdGggZD0iTTEzNSAxMjhoMjQyYzIyIDAgNDAgMTggNDAgNDB2MTI4YzAgMzEtMjUgNTYtNTYgNTZoLTRjLTI3IDAtNDktMjItNDktNDl2LTg3SDIwNHY4N2MwIDI3LTIyIDQ5LTQ5IDQ5aC00Yy0zMSAwLTU2LTI1LTU2LTU2VjE2OGMwLTIyIDE4LTQwIDQwLTQwWiIgZmlsbD0iI0ZGRkZGRiIvPjxwYXRoIGQ9Ik0yMDkgMTc0aDExOGwtMjEgODZjLTUgMjEgMiA0MyAxOCA1OGwxMyAxMkgyMTBjMjgtMzAgNDEtNjUgMzktMTA1bC00MC01MVoiIGZpbGw9IiNGODY4MDAiLz48cGF0aCBkPSJNMjAzIDE2OGgxMzhsLTEyIDQ2SDIxNmwtMTMtNDZaIiBmaWxsPSIjRkY4QTFGIi8+PHBhdGggZD0iTTIyMiAyMjNoNTJjMyAyNSAwIDUzLTkgODMiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIxMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTI5NCAyMjRjNiAzMyA2IDY3IDAgMTAxTTMyMCAyMjRjNSAzNCA1IDY4IDAgMTAxTTM0NSAyMjRjNCAzMiA0IDY1IDAgOTgiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIxMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTIwOSAzNTdjLTggMjQtMjAgNDMtMzkgNTdoMTUzYy0xNS0xMy0yNC0zMS0yNi01N0gyMDlaIiBmaWxsPSIjRkZGRkZGIi8+PC9zdmc+" alt="Sheikh Al Kar logo">\n        <h1>شيخ الكار</h1>\n        <p class="en center">Sheikh Al Kar</p>\n        <p>الفرع الرئيسي</p>\n        <p>Ramallah, Palestine</p>\n        \n        <p>الرقم الضريبي: <span dir="ltr">310048229</span></p>\n        <p><strong>REPRINT / إعادة طباعة</strong></p>\n      </header>\n      <section class="meta">\n        <div class="row"><span>الفاتورة</span><strong class="value invoice-number">#MAIN-REG-MAIN-01-2026-000025</strong></div>\n        <div class="row"><span>التاريخ</span><strong class="value ">19‏/7‏/2026</strong></div>\n        <div class="row"><span>الوقت</span><strong class="value ">11:17 م</strong></div>\n        <div class="row"><span>الموظف</span><strong class="value ">Omar Khalil</strong></div>\n        <div class="row"><span>الزبون</span><strong class="value ">test</strong></div>\n        <div class="row"><span>هاتف الزبون</span><strong class="value ">0598746584</strong></div>\n        <div class="row"><span>طريقة الدفع</span><strong class="value ">نقداً</strong></div>\n        <div class="row"><span>العملة</span><strong class="value ">ILS</strong></div>\n        <div class="row"><span>المدفوع</span><strong class="value ">ILS 36.90</strong></div>\n        <div class="row"><span>طريقة التسليم</span><strong class="value ">توصيل</strong></div>\n        <div class="row"><span>نوع الطلب</span><strong class="value ">توصيل</strong></div>\n        <div class="row"><span>ملاحظات</span><strong class="value ">test</strong></div>\n      </section>\n      <table><tbody>\n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>تيراميسو</strong>\n        \n        \n        \n        \n        <small>سعر الوحدة: ILS 5.00</small>\n      </td>\n      <td class="money">ILS 5.00</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>مارغريتا</strong>\n        \n        <small>وسط</small>\n        \n        \n        <small>سعر الوحدة: ILS 9.00</small>\n      </td>\n      <td class="money">ILS 9.00</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>بيبروني حار</strong>\n        \n        <small>وسط</small>\n        \n        \n        <small>سعر الوحدة: ILS 10.50</small>\n      </td>\n      <td class="money">ILS 10.50</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>سلطة حلوم</strong>\n        \n        \n        \n        \n        <small>سعر الوحدة: ILS 7.75</small>\n      </td>\n      <td class="money">ILS 7.75</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>فستق مثلج</strong>\n        \n        <small>عادي</small>\n        \n        \n        <small>سعر الوحدة: ILS 4.25</small>\n      </td>\n      <td class="money">ILS 4.25</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>بطاطا محملة</strong>\n        \n        <small>صغير</small>\n        \n        \n        <small>سعر الوحدة: ILS 4.50</small>\n      </td>\n      <td class="money">ILS 4.50</td>\n    </tr>\n  </tbody></table>\n      <section class="totals">\n        <div class="row "><span>المجموع</span><strong class="value">ILS 41.00</strong></div>\n        <div class="row "><span>الخصم</span><strong class="value">- ILS 4.10</strong></div>\n        \n        \n        \n        <div class="row strong"><span>الإجمالي</span><strong class="value">ILS 36.90</strong></div>\n        <div class="row "><span>المدفوع</span><strong class="value">ILS 36.90</strong></div>\n        \n      </section>\n      <footer>\n        <strong>شكراً لزيارتكم</strong>\n        <p>الأسعار تشمل الضريبة</p>\n        <p>الرقم الضريبي: <span dir="ltr">310048229</span></p>\n        <p class="invoice-number">cmrs8m6jt0001w89neogjma52</p>\n      </footer>\n    </main></body></html>	1	W80	\N	PRINTED	1	5	\N	\N	invoice:cmrs8m6jt0001w89neogjma52:receipt:reprint:1784493215070	2026-07-19 20:33:35.072	2026-07-19 21:01:09.07	2026-07-19 21:01:21.55	2026-07-19 21:01:22.821	\N	\N	f	\N	\N	f
cmrsacp420007wk9ndrbhukqm	cmr97q88n0000rs9nh4sethxg	cmrs0kvf90002t89nnfc21r9f	cmrs4db040007cg9nzhr3t2fc	cmrs8m6jt0001w89neogjma52	\N	cmrs8m6n9000aw89np74vlf3c	CUSTOMER_RECEIPT	HTML	<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>\n    :root{--receipt-width:60mm}@page{size:60mm auto;margin:0}*{box-sizing:border-box}\n    body.receipt-document{width:var(--receipt-width);margin:0;padding:0;background:#fff;color:#000;overflow:visible;font-family:Arial,Tahoma,"Segoe UI",sans-serif}\n    .receipt{width:var(--receipt-width);min-width:var(--receipt-width);max-width:var(--receipt-width);padding:4mm;box-sizing:border-box;font-family:Arial,Tahoma,"Segoe UI",sans-serif;font-size:11px;line-height:1.35;color:#000;background:#fff;overflow:visible;height:auto;max-height:none}\n    .receipt .logo{width:17mm;height:17mm;object-fit:contain;display:block;margin:0 auto 2mm}.receipt h1{font-size:17px;margin:0 0 1mm;text-align:center}.receipt p{margin:0 0 1mm}.receipt header,.receipt footer{text-align:center}\n    .receipt .center{text-align:center}.receipt .en{direction:ltr}.receipt .meta,.receipt .totals{border-top:1px dashed #000;border-bottom:1px dashed #000;margin:3mm 0;padding:2mm 0}\n    .receipt .row{display:flex;justify-content:space-between;align-items:flex-start;gap:3mm;margin:1mm 0}.receipt .row span:first-child{flex:0 0 auto}.receipt .value{overflow-wrap:anywhere;word-break:break-word;text-align:end;max-width:45mm}\n    .receipt .invoice-number{max-width:100%;overflow-wrap:anywhere;word-break:break-word;white-space:normal;direction:ltr;text-align:left}\n    .receipt table{width:100%;border-collapse:collapse}.receipt td{padding:1.5mm 0;vertical-align:top;border-bottom:1px dotted #999}.receipt .qty{width:9mm;font-weight:bold}.receipt .item-name{overflow-wrap:anywhere;word-break:break-word}.receipt .money{text-align:end;white-space:nowrap}\n    .receipt small{display:block;color:#333;margin-top:1mm}.receipt .strong{font-size:14px;font-weight:bold}.receipt footer{margin-top:4mm;font-size:10px}\n  </style></head><body class="receipt receipt-document">\n    <main class="receipt">\n      <header>\n        <img class="logo" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3QgeD0iNTQiIHk9IjQ2IiB3aWR0aD0iNDA0IiBoZWlnaHQ9IjQyMCIgcng9Ijg2IiBmaWxsPSIjRjg2ODAwIi8+PHBhdGggZD0iTTEzNSAxMjhoMjQyYzIyIDAgNDAgMTggNDAgNDB2MTI4YzAgMzEtMjUgNTYtNTYgNTZoLTRjLTI3IDAtNDktMjItNDktNDl2LTg3SDIwNHY4N2MwIDI3LTIyIDQ5LTQ5IDQ5aC00Yy0zMSAwLTU2LTI1LTU2LTU2VjE2OGMwLTIyIDE4LTQwIDQwLTQwWiIgZmlsbD0iI0ZGRkZGRiIvPjxwYXRoIGQ9Ik0yMDkgMTc0aDExOGwtMjEgODZjLTUgMjEgMiA0MyAxOCA1OGwxMyAxMkgyMTBjMjgtMzAgNDEtNjUgMzktMTA1bC00MC01MVoiIGZpbGw9IiNGODY4MDAiLz48cGF0aCBkPSJNMjAzIDE2OGgxMzhsLTEyIDQ2SDIxNmwtMTMtNDZaIiBmaWxsPSIjRkY4QTFGIi8+PHBhdGggZD0iTTIyMiAyMjNoNTJjMyAyNSAwIDUzLTkgODMiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIxMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTI5NCAyMjRjNiAzMyA2IDY3IDAgMTAxTTMyMCAyMjRjNSAzNCA1IDY4IDAgMTAxTTM0NSAyMjRjNCAzMiA0IDY1IDAgOTgiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIxMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTIwOSAzNTdjLTggMjQtMjAgNDMtMzkgNTdoMTUzYy0xNS0xMy0yNC0zMS0yNi01N0gyMDlaIiBmaWxsPSIjRkZGRkZGIi8+PC9zdmc+" alt="Sheikh Al Kar logo">\n        <h1>شيخ الكار</h1>\n        <p class="en center">Sheikh Al Kar</p>\n        <p>الفرع الرئيسي</p>\n        <p>Ramallah, Palestine</p>\n        \n        <p>الرقم الضريبي: <span dir="ltr">310048229</span></p>\n        <p><strong>REPRINT / إعادة طباعة</strong></p>\n      </header>\n      <section class="meta">\n        <div class="row"><span>الفاتورة</span><strong class="value invoice-number">#MAIN-REG-MAIN-01-2026-000025</strong></div>\n        <div class="row"><span>التاريخ</span><strong class="value ">19‏/7‏/2026</strong></div>\n        <div class="row"><span>الوقت</span><strong class="value ">11:17 م</strong></div>\n        <div class="row"><span>الموظف</span><strong class="value ">Omar Khalil</strong></div>\n        <div class="row"><span>الزبون</span><strong class="value ">test</strong></div>\n        <div class="row"><span>هاتف الزبون</span><strong class="value ">0598746584</strong></div>\n        <div class="row"><span>طريقة الدفع</span><strong class="value ">نقداً</strong></div>\n        <div class="row"><span>العملة</span><strong class="value ">ILS</strong></div>\n        <div class="row"><span>المدفوع</span><strong class="value ">ILS 36.90</strong></div>\n        <div class="row"><span>طريقة التسليم</span><strong class="value ">توصيل</strong></div>\n        <div class="row"><span>نوع الطلب</span><strong class="value ">توصيل</strong></div>\n        <div class="row"><span>ملاحظات</span><strong class="value ">test</strong></div>\n      </section>\n      <table><tbody>\n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>تيراميسو</strong>\n        \n        \n        \n        \n        <small>سعر الوحدة: ILS 5.00</small>\n      </td>\n      <td class="money">ILS 5.00</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>مارغريتا</strong>\n        \n        <small>وسط</small>\n        \n        \n        <small>سعر الوحدة: ILS 9.00</small>\n      </td>\n      <td class="money">ILS 9.00</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>بيبروني حار</strong>\n        \n        <small>وسط</small>\n        \n        \n        <small>سعر الوحدة: ILS 10.50</small>\n      </td>\n      <td class="money">ILS 10.50</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>سلطة حلوم</strong>\n        \n        \n        \n        \n        <small>سعر الوحدة: ILS 7.75</small>\n      </td>\n      <td class="money">ILS 7.75</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>فستق مثلج</strong>\n        \n        <small>عادي</small>\n        \n        \n        <small>سعر الوحدة: ILS 4.25</small>\n      </td>\n      <td class="money">ILS 4.25</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>بطاطا محملة</strong>\n        \n        <small>صغير</small>\n        \n        \n        <small>سعر الوحدة: ILS 4.50</small>\n      </td>\n      <td class="money">ILS 4.50</td>\n    </tr>\n  </tbody></table>\n      <section class="totals">\n        <div class="row "><span>المجموع</span><strong class="value">ILS 41.00</strong></div>\n        <div class="row "><span>الخصم</span><strong class="value">- ILS 4.10</strong></div>\n        \n        \n        \n        <div class="row strong"><span>الإجمالي</span><strong class="value">ILS 36.90</strong></div>\n        <div class="row "><span>المدفوع</span><strong class="value">ILS 36.90</strong></div>\n        \n      </section>\n      <footer>\n        <strong>شكراً لزيارتكم</strong>\n        <p>الأسعار تشمل الضريبة</p>\n        <p>الرقم الضريبي: <span dir="ltr">310048229</span></p>\n        <p class="invoice-number">cmrs8m6jt0001w89neogjma52</p>\n      </footer>\n    </main></body></html>	1	W80	\N	PRINTED	1	5	\N	\N	invoice:cmrs8m6jt0001w89neogjma52:receipt:reprint:1784495174687	2026-07-19 21:06:14.69	2026-07-19 21:06:14.73	2026-07-19 21:06:14.969	2026-07-19 21:06:16.418	\N	\N	f	\N	\N	f
cmrs915fn0000589n8f8ul1yv	cmr97q88n0000rs9nh4sethxg	cmrs0kvf90002t89nnfc21r9f	cmrs4db040007cg9nzhr3t2fc	cmrs8m6jt0001w89neogjma52	\N	cmrs8m6n9000aw89np74vlf3c	CUSTOMER_RECEIPT	HTML	<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>\n    :root{--receipt-width:60mm}@page{size:60mm auto;margin:0}*{box-sizing:border-box}\n    body.receipt-document{width:var(--receipt-width);margin:0;padding:0;background:#fff;color:#000;overflow:visible;font-family:Arial,Tahoma,"Segoe UI",sans-serif}\n    .receipt{width:var(--receipt-width);min-width:var(--receipt-width);max-width:var(--receipt-width);padding:4mm;box-sizing:border-box;font-family:Arial,Tahoma,"Segoe UI",sans-serif;font-size:11px;line-height:1.35;color:#000;background:#fff;overflow:visible;height:auto;max-height:none}\n    .logo{width:17mm;height:17mm;object-fit:contain;display:block;margin:0 auto 2mm}h1{font-size:17px;margin:0 0 1mm;text-align:center}p{margin:0 0 1mm}header,footer{text-align:center}\n    .center{text-align:center}.en{direction:ltr}.meta,.totals{border-top:1px dashed #000;border-bottom:1px dashed #000;margin:3mm 0;padding:2mm 0}\n    .row{display:flex;justify-content:space-between;align-items:flex-start;gap:3mm;margin:1mm 0}.row span:first-child{flex:0 0 auto}.value{overflow-wrap:anywhere;word-break:break-word;text-align:end;max-width:45mm}\n    .invoice-number{max-width:100%;overflow-wrap:anywhere;word-break:break-word;white-space:normal;direction:ltr;text-align:left}\n    table{width:100%;border-collapse:collapse}td{padding:1.5mm 0;vertical-align:top;border-bottom:1px dotted #999}.qty{width:9mm;font-weight:bold}.item-name{overflow-wrap:anywhere;word-break:break-word}.money{text-align:end;white-space:nowrap}\n    small{display:block;color:#333;margin-top:1mm}.strong{font-size:14px;font-weight:bold}footer{margin-top:4mm;font-size:10px}\n  </style></head><body class="receipt receipt-document">\n    <main class="receipt">\n      <header>\n        <img class="logo" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3QgeD0iNTQiIHk9IjQ2IiB3aWR0aD0iNDA0IiBoZWlnaHQ9IjQyMCIgcng9Ijg2IiBmaWxsPSIjRjg2ODAwIi8+PHBhdGggZD0iTTEzNSAxMjhoMjQyYzIyIDAgNDAgMTggNDAgNDB2MTI4YzAgMzEtMjUgNTYtNTYgNTZoLTRjLTI3IDAtNDktMjItNDktNDl2LTg3SDIwNHY4N2MwIDI3LTIyIDQ5LTQ5IDQ5aC00Yy0zMSAwLTU2LTI1LTU2LTU2VjE2OGMwLTIyIDE4LTQwIDQwLTQwWiIgZmlsbD0iI0ZGRkZGRiIvPjxwYXRoIGQ9Ik0yMDkgMTc0aDExOGwtMjEgODZjLTUgMjEgMiA0MyAxOCA1OGwxMyAxMkgyMTBjMjgtMzAgNDEtNjUgMzktMTA1bC00MC01MVoiIGZpbGw9IiNGODY4MDAiLz48cGF0aCBkPSJNMjAzIDE2OGgxMzhsLTEyIDQ2SDIxNmwtMTMtNDZaIiBmaWxsPSIjRkY4QTFGIi8+PHBhdGggZD0iTTIyMiAyMjNoNTJjMyAyNSAwIDUzLTkgODMiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIxMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTI5NCAyMjRjNiAzMyA2IDY3IDAgMTAxTTMyMCAyMjRjNSAzNCA1IDY4IDAgMTAxTTM0NSAyMjRjNCAzMiA0IDY1IDAgOTgiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIxMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTIwOSAzNTdjLTggMjQtMjAgNDMtMzkgNTdoMTUzYy0xNS0xMy0yNC0zMS0yNi01N0gyMDlaIiBmaWxsPSIjRkZGRkZGIi8+PC9zdmc+" alt="Sheikh Al Kar logo">\n        <h1>شيخ الكار</h1>\n        <p class="en center">Sheikh Al Kar</p>\n        <p>الفرع الرئيسي</p>\n        <p>Ramallah, Palestine</p>\n        \n        <p>الرقم الضريبي: <span dir="ltr">310048229</span></p>\n        <p><strong>REPRINT / إعادة طباعة</strong></p>\n      </header>\n      <section class="meta">\n        <div class="row"><span>الفاتورة</span><strong class="value invoice-number">#MAIN-REG-MAIN-01-2026-000025</strong></div>\n        <div class="row"><span>التاريخ</span><strong class="value ">19‏/7‏/2026</strong></div>\n        <div class="row"><span>الوقت</span><strong class="value ">11:17 م</strong></div>\n        <div class="row"><span>الموظف</span><strong class="value ">Omar Khalil</strong></div>\n        <div class="row"><span>الزبون</span><strong class="value ">test</strong></div>\n        <div class="row"><span>هاتف الزبون</span><strong class="value ">0598746584</strong></div>\n        <div class="row"><span>طريقة الدفع</span><strong class="value ">نقداً</strong></div>\n        <div class="row"><span>العملة</span><strong class="value ">ILS</strong></div>\n        <div class="row"><span>المدفوع</span><strong class="value ">ILS 36.90</strong></div>\n        <div class="row"><span>طريقة التسليم</span><strong class="value ">توصيل</strong></div>\n        <div class="row"><span>نوع الطلب</span><strong class="value ">توصيل</strong></div>\n        <div class="row"><span>ملاحظات</span><strong class="value ">test</strong></div>\n      </section>\n      <table><tbody>\n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>تيراميسو</strong>\n        \n        \n        \n        \n        <small>سعر الوحدة: ILS 5.00</small>\n      </td>\n      <td class="money">ILS 5.00</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>مارغريتا</strong>\n        \n        <small>وسط</small>\n        \n        \n        <small>سعر الوحدة: ILS 9.00</small>\n      </td>\n      <td class="money">ILS 9.00</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>بيبروني حار</strong>\n        \n        <small>وسط</small>\n        \n        \n        <small>سعر الوحدة: ILS 10.50</small>\n      </td>\n      <td class="money">ILS 10.50</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>سلطة حلوم</strong>\n        \n        \n        \n        \n        <small>سعر الوحدة: ILS 7.75</small>\n      </td>\n      <td class="money">ILS 7.75</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>فستق مثلج</strong>\n        \n        <small>عادي</small>\n        \n        \n        <small>سعر الوحدة: ILS 4.25</small>\n      </td>\n      <td class="money">ILS 4.25</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>بطاطا محملة</strong>\n        \n        <small>صغير</small>\n        \n        \n        <small>سعر الوحدة: ILS 4.50</small>\n      </td>\n      <td class="money">ILS 4.50</td>\n    </tr>\n  </tbody></table>\n      <section class="totals">\n        <div class="row "><span>المجموع</span><strong class="value">ILS 41.00</strong></div>\n        <div class="row "><span>الخصم</span><strong class="value">- ILS 4.10</strong></div>\n        \n        \n        \n        <div class="row strong"><span>الإجمالي</span><strong class="value">ILS 36.90</strong></div>\n        <div class="row "><span>المدفوع</span><strong class="value">ILS 36.90</strong></div>\n        \n      </section>\n      <footer>\n        <strong>شكراً لزيارتكم</strong>\n        <p>الأسعار تشمل الضريبة</p>\n        <p>الرقم الضريبي: <span dir="ltr">310048229</span></p>\n        <p class="invoice-number">cmrs8m6jt0001w89neogjma52</p>\n      </footer>\n    </main></body></html>	1	W80	\N	PRINTED	1	5	\N	\N	invoice:cmrs8m6jt0001w89neogjma52:receipt:reprint:1784492956344	2026-07-19 20:29:16.355	2026-07-19 21:01:09.035	2026-07-19 21:01:10.129	2026-07-19 21:01:12.69	\N	\N	f	\N	\N	f
cmrs92l3s0002589nkzeourmj	cmr97q88n0000rs9nh4sethxg	cmrs0kvf90002t89nnfc21r9f	cmrs4db040007cg9nzhr3t2fc	cmrs8m6jt0001w89neogjma52	\N	cmrs8m6n9000aw89np74vlf3c	CUSTOMER_RECEIPT	HTML	<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>\n    :root{--receipt-width:60mm}@page{size:60mm auto;margin:0}*{box-sizing:border-box}\n    body.receipt-document{width:var(--receipt-width);margin:0;padding:0;background:#fff;color:#000;overflow:visible;font-family:Arial,Tahoma,"Segoe UI",sans-serif}\n    .receipt{width:var(--receipt-width);min-width:var(--receipt-width);max-width:var(--receipt-width);padding:4mm;box-sizing:border-box;font-family:Arial,Tahoma,"Segoe UI",sans-serif;font-size:11px;line-height:1.35;color:#000;background:#fff;overflow:visible;height:auto;max-height:none}\n    .receipt .logo{width:17mm;height:17mm;object-fit:contain;display:block;margin:0 auto 2mm}.receipt h1{font-size:17px;margin:0 0 1mm;text-align:center}.receipt p{margin:0 0 1mm}.receipt header,.receipt footer{text-align:center}\n    .receipt .center{text-align:center}.receipt .en{direction:ltr}.receipt .meta,.receipt .totals{border-top:1px dashed #000;border-bottom:1px dashed #000;margin:3mm 0;padding:2mm 0}\n    .receipt .row{display:flex;justify-content:space-between;align-items:flex-start;gap:3mm;margin:1mm 0}.receipt .row span:first-child{flex:0 0 auto}.receipt .value{overflow-wrap:anywhere;word-break:break-word;text-align:end;max-width:45mm}\n    .receipt .invoice-number{max-width:100%;overflow-wrap:anywhere;word-break:break-word;white-space:normal;direction:ltr;text-align:left}\n    .receipt table{width:100%;border-collapse:collapse}.receipt td{padding:1.5mm 0;vertical-align:top;border-bottom:1px dotted #999}.receipt .qty{width:9mm;font-weight:bold}.receipt .item-name{overflow-wrap:anywhere;word-break:break-word}.receipt .money{text-align:end;white-space:nowrap}\n    .receipt small{display:block;color:#333;margin-top:1mm}.receipt .strong{font-size:14px;font-weight:bold}.receipt footer{margin-top:4mm;font-size:10px}\n  </style></head><body class="receipt receipt-document">\n    <main class="receipt">\n      <header>\n        <img class="logo" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3QgeD0iNTQiIHk9IjQ2IiB3aWR0aD0iNDA0IiBoZWlnaHQ9IjQyMCIgcng9Ijg2IiBmaWxsPSIjRjg2ODAwIi8+PHBhdGggZD0iTTEzNSAxMjhoMjQyYzIyIDAgNDAgMTggNDAgNDB2MTI4YzAgMzEtMjUgNTYtNTYgNTZoLTRjLTI3IDAtNDktMjItNDktNDl2LTg3SDIwNHY4N2MwIDI3LTIyIDQ5LTQ5IDQ5aC00Yy0zMSAwLTU2LTI1LTU2LTU2VjE2OGMwLTIyIDE4LTQwIDQwLTQwWiIgZmlsbD0iI0ZGRkZGRiIvPjxwYXRoIGQ9Ik0yMDkgMTc0aDExOGwtMjEgODZjLTUgMjEgMiA0MyAxOCA1OGwxMyAxMkgyMTBjMjgtMzAgNDEtNjUgMzktMTA1bC00MC01MVoiIGZpbGw9IiNGODY4MDAiLz48cGF0aCBkPSJNMjAzIDE2OGgxMzhsLTEyIDQ2SDIxNmwtMTMtNDZaIiBmaWxsPSIjRkY4QTFGIi8+PHBhdGggZD0iTTIyMiAyMjNoNTJjMyAyNSAwIDUzLTkgODMiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIxMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTI5NCAyMjRjNiAzMyA2IDY3IDAgMTAxTTMyMCAyMjRjNSAzNCA1IDY4IDAgMTAxTTM0NSAyMjRjNCAzMiA0IDY1IDAgOTgiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIxMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTIwOSAzNTdjLTggMjQtMjAgNDMtMzkgNTdoMTUzYy0xNS0xMy0yNC0zMS0yNi01N0gyMDlaIiBmaWxsPSIjRkZGRkZGIi8+PC9zdmc+" alt="Sheikh Al Kar logo">\n        <h1>شيخ الكار</h1>\n        <p class="en center">Sheikh Al Kar</p>\n        <p>الفرع الرئيسي</p>\n        <p>Ramallah, Palestine</p>\n        \n        <p>الرقم الضريبي: <span dir="ltr">310048229</span></p>\n        <p><strong>REPRINT / إعادة طباعة</strong></p>\n      </header>\n      <section class="meta">\n        <div class="row"><span>الفاتورة</span><strong class="value invoice-number">#MAIN-REG-MAIN-01-2026-000025</strong></div>\n        <div class="row"><span>التاريخ</span><strong class="value ">19‏/7‏/2026</strong></div>\n        <div class="row"><span>الوقت</span><strong class="value ">11:17 م</strong></div>\n        <div class="row"><span>الموظف</span><strong class="value ">Omar Khalil</strong></div>\n        <div class="row"><span>الزبون</span><strong class="value ">test</strong></div>\n        <div class="row"><span>هاتف الزبون</span><strong class="value ">0598746584</strong></div>\n        <div class="row"><span>طريقة الدفع</span><strong class="value ">نقداً</strong></div>\n        <div class="row"><span>العملة</span><strong class="value ">ILS</strong></div>\n        <div class="row"><span>المدفوع</span><strong class="value ">ILS 36.90</strong></div>\n        <div class="row"><span>طريقة التسليم</span><strong class="value ">توصيل</strong></div>\n        <div class="row"><span>نوع الطلب</span><strong class="value ">توصيل</strong></div>\n        <div class="row"><span>ملاحظات</span><strong class="value ">test</strong></div>\n      </section>\n      <table><tbody>\n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>تيراميسو</strong>\n        \n        \n        \n        \n        <small>سعر الوحدة: ILS 5.00</small>\n      </td>\n      <td class="money">ILS 5.00</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>مارغريتا</strong>\n        \n        <small>وسط</small>\n        \n        \n        <small>سعر الوحدة: ILS 9.00</small>\n      </td>\n      <td class="money">ILS 9.00</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>بيبروني حار</strong>\n        \n        <small>وسط</small>\n        \n        \n        <small>سعر الوحدة: ILS 10.50</small>\n      </td>\n      <td class="money">ILS 10.50</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>سلطة حلوم</strong>\n        \n        \n        \n        \n        <small>سعر الوحدة: ILS 7.75</small>\n      </td>\n      <td class="money">ILS 7.75</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>فستق مثلج</strong>\n        \n        <small>عادي</small>\n        \n        \n        <small>سعر الوحدة: ILS 4.25</small>\n      </td>\n      <td class="money">ILS 4.25</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>بطاطا محملة</strong>\n        \n        <small>صغير</small>\n        \n        \n        <small>سعر الوحدة: ILS 4.50</small>\n      </td>\n      <td class="money">ILS 4.50</td>\n    </tr>\n  </tbody></table>\n      <section class="totals">\n        <div class="row "><span>المجموع</span><strong class="value">ILS 41.00</strong></div>\n        <div class="row "><span>الخصم</span><strong class="value">- ILS 4.10</strong></div>\n        \n        \n        \n        <div class="row strong"><span>الإجمالي</span><strong class="value">ILS 36.90</strong></div>\n        <div class="row "><span>المدفوع</span><strong class="value">ILS 36.90</strong></div>\n        \n      </section>\n      <footer>\n        <strong>شكراً لزيارتكم</strong>\n        <p>الأسعار تشمل الضريبة</p>\n        <p>الرقم الضريبي: <span dir="ltr">310048229</span></p>\n        <p class="invoice-number">cmrs8m6jt0001w89neogjma52</p>\n      </footer>\n    </main></body></html>	1	W80	\N	PRINTED	1	5	\N	\N	invoice:cmrs8m6jt0001w89neogjma52:receipt:reprint:1784493023317	2026-07-19 20:30:23.32	2026-07-19 21:01:09.053	2026-07-19 21:01:14.194	2026-07-19 21:01:15.472	\N	\N	f	\N	\N	f
cmrs96ufo0008589nmu6zydcg	cmr97q88n0000rs9nh4sethxg	cmrs0kvf90002t89nnfc21r9f	cmrs4db040007cg9nzhr3t2fc	cmrs8m6jt0001w89neogjma52	\N	cmrs8m6n9000aw89np74vlf3c	CUSTOMER_RECEIPT	HTML	<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>\n    :root{--receipt-width:60mm}@page{size:60mm auto;margin:0}*{box-sizing:border-box}\n    body.receipt-document{width:var(--receipt-width);margin:0;padding:0;background:#fff;color:#000;overflow:visible;font-family:Arial,Tahoma,"Segoe UI",sans-serif}\n    .receipt{width:var(--receipt-width);min-width:var(--receipt-width);max-width:var(--receipt-width);padding:4mm;box-sizing:border-box;font-family:Arial,Tahoma,"Segoe UI",sans-serif;font-size:11px;line-height:1.35;color:#000;background:#fff;overflow:visible;height:auto;max-height:none}\n    .receipt .logo{width:17mm;height:17mm;object-fit:contain;display:block;margin:0 auto 2mm}.receipt h1{font-size:17px;margin:0 0 1mm;text-align:center}.receipt p{margin:0 0 1mm}.receipt header,.receipt footer{text-align:center}\n    .receipt .center{text-align:center}.receipt .en{direction:ltr}.receipt .meta,.receipt .totals{border-top:1px dashed #000;border-bottom:1px dashed #000;margin:3mm 0;padding:2mm 0}\n    .receipt .row{display:flex;justify-content:space-between;align-items:flex-start;gap:3mm;margin:1mm 0}.receipt .row span:first-child{flex:0 0 auto}.receipt .value{overflow-wrap:anywhere;word-break:break-word;text-align:end;max-width:45mm}\n    .receipt .invoice-number{max-width:100%;overflow-wrap:anywhere;word-break:break-word;white-space:normal;direction:ltr;text-align:left}\n    .receipt table{width:100%;border-collapse:collapse}.receipt td{padding:1.5mm 0;vertical-align:top;border-bottom:1px dotted #999}.receipt .qty{width:9mm;font-weight:bold}.receipt .item-name{overflow-wrap:anywhere;word-break:break-word}.receipt .money{text-align:end;white-space:nowrap}\n    .receipt small{display:block;color:#333;margin-top:1mm}.receipt .strong{font-size:14px;font-weight:bold}.receipt footer{margin-top:4mm;font-size:10px}\n  </style></head><body class="receipt receipt-document">\n    <main class="receipt">\n      <header>\n        <img class="logo" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3QgeD0iNTQiIHk9IjQ2IiB3aWR0aD0iNDA0IiBoZWlnaHQ9IjQyMCIgcng9Ijg2IiBmaWxsPSIjRjg2ODAwIi8+PHBhdGggZD0iTTEzNSAxMjhoMjQyYzIyIDAgNDAgMTggNDAgNDB2MTI4YzAgMzEtMjUgNTYtNTYgNTZoLTRjLTI3IDAtNDktMjItNDktNDl2LTg3SDIwNHY4N2MwIDI3LTIyIDQ5LTQ5IDQ5aC00Yy0zMSAwLTU2LTI1LTU2LTU2VjE2OGMwLTIyIDE4LTQwIDQwLTQwWiIgZmlsbD0iI0ZGRkZGRiIvPjxwYXRoIGQ9Ik0yMDkgMTc0aDExOGwtMjEgODZjLTUgMjEgMiA0MyAxOCA1OGwxMyAxMkgyMTBjMjgtMzAgNDEtNjUgMzktMTA1bC00MC01MVoiIGZpbGw9IiNGODY4MDAiLz48cGF0aCBkPSJNMjAzIDE2OGgxMzhsLTEyIDQ2SDIxNmwtMTMtNDZaIiBmaWxsPSIjRkY4QTFGIi8+PHBhdGggZD0iTTIyMiAyMjNoNTJjMyAyNSAwIDUzLTkgODMiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIxMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTI5NCAyMjRjNiAzMyA2IDY3IDAgMTAxTTMyMCAyMjRjNSAzNCA1IDY4IDAgMTAxTTM0NSAyMjRjNCAzMiA0IDY1IDAgOTgiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIxMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTIwOSAzNTdjLTggMjQtMjAgNDMtMzkgNTdoMTUzYy0xNS0xMy0yNC0zMS0yNi01N0gyMDlaIiBmaWxsPSIjRkZGRkZGIi8+PC9zdmc+" alt="Sheikh Al Kar logo">\n        <h1>شيخ الكار</h1>\n        <p class="en center">Sheikh Al Kar</p>\n        <p>الفرع الرئيسي</p>\n        <p>Ramallah, Palestine</p>\n        \n        <p>الرقم الضريبي: <span dir="ltr">310048229</span></p>\n        <p><strong>REPRINT / إعادة طباعة</strong></p>\n      </header>\n      <section class="meta">\n        <div class="row"><span>الفاتورة</span><strong class="value invoice-number">#MAIN-REG-MAIN-01-2026-000025</strong></div>\n        <div class="row"><span>التاريخ</span><strong class="value ">19‏/7‏/2026</strong></div>\n        <div class="row"><span>الوقت</span><strong class="value ">11:17 م</strong></div>\n        <div class="row"><span>الموظف</span><strong class="value ">Omar Khalil</strong></div>\n        <div class="row"><span>الزبون</span><strong class="value ">test</strong></div>\n        <div class="row"><span>هاتف الزبون</span><strong class="value ">0598746584</strong></div>\n        <div class="row"><span>طريقة الدفع</span><strong class="value ">نقداً</strong></div>\n        <div class="row"><span>العملة</span><strong class="value ">ILS</strong></div>\n        <div class="row"><span>المدفوع</span><strong class="value ">ILS 36.90</strong></div>\n        <div class="row"><span>طريقة التسليم</span><strong class="value ">توصيل</strong></div>\n        <div class="row"><span>نوع الطلب</span><strong class="value ">توصيل</strong></div>\n        <div class="row"><span>ملاحظات</span><strong class="value ">test</strong></div>\n      </section>\n      <table><tbody>\n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>تيراميسو</strong>\n        \n        \n        \n        \n        <small>سعر الوحدة: ILS 5.00</small>\n      </td>\n      <td class="money">ILS 5.00</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>مارغريتا</strong>\n        \n        <small>وسط</small>\n        \n        \n        <small>سعر الوحدة: ILS 9.00</small>\n      </td>\n      <td class="money">ILS 9.00</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>بيبروني حار</strong>\n        \n        <small>وسط</small>\n        \n        \n        <small>سعر الوحدة: ILS 10.50</small>\n      </td>\n      <td class="money">ILS 10.50</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>سلطة حلوم</strong>\n        \n        \n        \n        \n        <small>سعر الوحدة: ILS 7.75</small>\n      </td>\n      <td class="money">ILS 7.75</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>فستق مثلج</strong>\n        \n        <small>عادي</small>\n        \n        \n        <small>سعر الوحدة: ILS 4.25</small>\n      </td>\n      <td class="money">ILS 4.25</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>بطاطا محملة</strong>\n        \n        <small>صغير</small>\n        \n        \n        <small>سعر الوحدة: ILS 4.50</small>\n      </td>\n      <td class="money">ILS 4.50</td>\n    </tr>\n  </tbody></table>\n      <section class="totals">\n        <div class="row "><span>المجموع</span><strong class="value">ILS 41.00</strong></div>\n        <div class="row "><span>الخصم</span><strong class="value">- ILS 4.10</strong></div>\n        \n        \n        \n        <div class="row strong"><span>الإجمالي</span><strong class="value">ILS 36.90</strong></div>\n        <div class="row "><span>المدفوع</span><strong class="value">ILS 36.90</strong></div>\n        \n      </section>\n      <footer>\n        <strong>شكراً لزيارتكم</strong>\n        <p>الأسعار تشمل الضريبة</p>\n        <p>الرقم الضريبي: <span dir="ltr">310048229</span></p>\n        <p class="invoice-number">cmrs8m6jt0001w89neogjma52</p>\n      </footer>\n    </main></body></html>	1	W80	\N	PRINTED	1	5	\N	\N	invoice:cmrs8m6jt0001w89neogjma52:receipt:reprint:1784493222033	2026-07-19 20:33:42.037	2026-07-19 21:01:09.073	2026-07-19 21:01:22.963	2026-07-19 21:01:24.348	\N	\N	f	\N	\N	f
cmrsa28pb0009589ngkcxg76a	cmr97q88n0000rs9nh4sethxg	cmrs0kvf90002t89nnfc21r9f	cmrs4db040007cg9nzhr3t2fc	cmrs8m6jt0001w89neogjma52	\N	cmrs8m6n9000aw89np74vlf3c	CUSTOMER_RECEIPT	HTML	<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>\n    :root{--receipt-width:60mm}@page{size:60mm auto;margin:0}*{box-sizing:border-box}\n    body.receipt-document{width:var(--receipt-width);margin:0;padding:0;background:#fff;color:#000;overflow:visible;font-family:Arial,Tahoma,"Segoe UI",sans-serif}\n    .receipt{width:var(--receipt-width);min-width:var(--receipt-width);max-width:var(--receipt-width);padding:4mm;box-sizing:border-box;font-family:Arial,Tahoma,"Segoe UI",sans-serif;font-size:11px;line-height:1.35;color:#000;background:#fff;overflow:visible;height:auto;max-height:none}\n    .receipt .logo{width:17mm;height:17mm;object-fit:contain;display:block;margin:0 auto 2mm}.receipt h1{font-size:17px;margin:0 0 1mm;text-align:center}.receipt p{margin:0 0 1mm}.receipt header,.receipt footer{text-align:center}\n    .receipt .center{text-align:center}.receipt .en{direction:ltr}.receipt .meta,.receipt .totals{border-top:1px dashed #000;border-bottom:1px dashed #000;margin:3mm 0;padding:2mm 0}\n    .receipt .row{display:flex;justify-content:space-between;align-items:flex-start;gap:3mm;margin:1mm 0}.receipt .row span:first-child{flex:0 0 auto}.receipt .value{overflow-wrap:anywhere;word-break:break-word;text-align:end;max-width:45mm}\n    .receipt .invoice-number{max-width:100%;overflow-wrap:anywhere;word-break:break-word;white-space:normal;direction:ltr;text-align:left}\n    .receipt table{width:100%;border-collapse:collapse}.receipt td{padding:1.5mm 0;vertical-align:top;border-bottom:1px dotted #999}.receipt .qty{width:9mm;font-weight:bold}.receipt .item-name{overflow-wrap:anywhere;word-break:break-word}.receipt .money{text-align:end;white-space:nowrap}\n    .receipt small{display:block;color:#333;margin-top:1mm}.receipt .strong{font-size:14px;font-weight:bold}.receipt footer{margin-top:4mm;font-size:10px}\n  </style></head><body class="receipt receipt-document">\n    <main class="receipt">\n      <header>\n        <img class="logo" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3QgeD0iNTQiIHk9IjQ2IiB3aWR0aD0iNDA0IiBoZWlnaHQ9IjQyMCIgcng9Ijg2IiBmaWxsPSIjRjg2ODAwIi8+PHBhdGggZD0iTTEzNSAxMjhoMjQyYzIyIDAgNDAgMTggNDAgNDB2MTI4YzAgMzEtMjUgNTYtNTYgNTZoLTRjLTI3IDAtNDktMjItNDktNDl2LTg3SDIwNHY4N2MwIDI3LTIyIDQ5LTQ5IDQ5aC00Yy0zMSAwLTU2LTI1LTU2LTU2VjE2OGMwLTIyIDE4LTQwIDQwLTQwWiIgZmlsbD0iI0ZGRkZGRiIvPjxwYXRoIGQ9Ik0yMDkgMTc0aDExOGwtMjEgODZjLTUgMjEgMiA0MyAxOCA1OGwxMyAxMkgyMTBjMjgtMzAgNDEtNjUgMzktMTA1bC00MC01MVoiIGZpbGw9IiNGODY4MDAiLz48cGF0aCBkPSJNMjAzIDE2OGgxMzhsLTEyIDQ2SDIxNmwtMTMtNDZaIiBmaWxsPSIjRkY4QTFGIi8+PHBhdGggZD0iTTIyMiAyMjNoNTJjMyAyNSAwIDUzLTkgODMiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIxMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTI5NCAyMjRjNiAzMyA2IDY3IDAgMTAxTTMyMCAyMjRjNSAzNCA1IDY4IDAgMTAxTTM0NSAyMjRjNCAzMiA0IDY1IDAgOTgiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIxMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTIwOSAzNTdjLTggMjQtMjAgNDMtMzkgNTdoMTUzYy0xNS0xMy0yNC0zMS0yNi01N0gyMDlaIiBmaWxsPSIjRkZGRkZGIi8+PC9zdmc+" alt="Sheikh Al Kar logo">\n        <h1>شيخ الكار</h1>\n        <p class="en center">Sheikh Al Kar</p>\n        <p>الفرع الرئيسي</p>\n        <p>Ramallah, Palestine</p>\n        \n        <p>الرقم الضريبي: <span dir="ltr">310048229</span></p>\n        <p><strong>REPRINT / إعادة طباعة</strong></p>\n      </header>\n      <section class="meta">\n        <div class="row"><span>الفاتورة</span><strong class="value invoice-number">#MAIN-REG-MAIN-01-2026-000025</strong></div>\n        <div class="row"><span>التاريخ</span><strong class="value ">19‏/7‏/2026</strong></div>\n        <div class="row"><span>الوقت</span><strong class="value ">11:17 م</strong></div>\n        <div class="row"><span>الموظف</span><strong class="value ">Omar Khalil</strong></div>\n        <div class="row"><span>الزبون</span><strong class="value ">test</strong></div>\n        <div class="row"><span>هاتف الزبون</span><strong class="value ">0598746584</strong></div>\n        <div class="row"><span>طريقة الدفع</span><strong class="value ">نقداً</strong></div>\n        <div class="row"><span>العملة</span><strong class="value ">ILS</strong></div>\n        <div class="row"><span>المدفوع</span><strong class="value ">ILS 36.90</strong></div>\n        <div class="row"><span>طريقة التسليم</span><strong class="value ">توصيل</strong></div>\n        <div class="row"><span>نوع الطلب</span><strong class="value ">توصيل</strong></div>\n        <div class="row"><span>ملاحظات</span><strong class="value ">test</strong></div>\n      </section>\n      <table><tbody>\n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>تيراميسو</strong>\n        \n        \n        \n        \n        <small>سعر الوحدة: ILS 5.00</small>\n      </td>\n      <td class="money">ILS 5.00</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>مارغريتا</strong>\n        \n        <small>وسط</small>\n        \n        \n        <small>سعر الوحدة: ILS 9.00</small>\n      </td>\n      <td class="money">ILS 9.00</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>بيبروني حار</strong>\n        \n        <small>وسط</small>\n        \n        \n        <small>سعر الوحدة: ILS 10.50</small>\n      </td>\n      <td class="money">ILS 10.50</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>سلطة حلوم</strong>\n        \n        \n        \n        \n        <small>سعر الوحدة: ILS 7.75</small>\n      </td>\n      <td class="money">ILS 7.75</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>فستق مثلج</strong>\n        \n        <small>عادي</small>\n        \n        \n        <small>سعر الوحدة: ILS 4.25</small>\n      </td>\n      <td class="money">ILS 4.25</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>بطاطا محملة</strong>\n        \n        <small>صغير</small>\n        \n        \n        <small>سعر الوحدة: ILS 4.50</small>\n      </td>\n      <td class="money">ILS 4.50</td>\n    </tr>\n  </tbody></table>\n      <section class="totals">\n        <div class="row "><span>المجموع</span><strong class="value">ILS 41.00</strong></div>\n        <div class="row "><span>الخصم</span><strong class="value">- ILS 4.10</strong></div>\n        \n        \n        \n        <div class="row strong"><span>الإجمالي</span><strong class="value">ILS 36.90</strong></div>\n        <div class="row "><span>المدفوع</span><strong class="value">ILS 36.90</strong></div>\n        \n      </section>\n      <footer>\n        <strong>شكراً لزيارتكم</strong>\n        <p>الأسعار تشمل الضريبة</p>\n        <p>الرقم الضريبي: <span dir="ltr">310048229</span></p>\n        <p class="invoice-number">cmrs8m6jt0001w89neogjma52</p>\n      </footer>\n    </main></body></html>	1	W80	\N	PRINTED	1	5	\N	\N	invoice:cmrs8m6jt0001w89neogjma52:receipt:reprint:1784494686856	2026-07-19 20:58:06.863	2026-07-19 21:01:09.075	2026-07-19 21:01:24.528	2026-07-19 21:01:25.843	\N	\N	f	\N	\N	f
cmrsa2pd0000a589nff5ucmmg	cmr97q88n0000rs9nh4sethxg	cmrs0kvf90002t89nnfc21r9f	cmrs4db040007cg9nzhr3t2fc	cmrs8m6jt0001w89neogjma52	\N	cmrs8m6n9000aw89np74vlf3c	CUSTOMER_RECEIPT	HTML	<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>\n    :root{--receipt-width:60mm}@page{size:60mm auto;margin:0}*{box-sizing:border-box}\n    body.receipt-document{width:var(--receipt-width);margin:0;padding:0;background:#fff;color:#000;overflow:visible;font-family:Arial,Tahoma,"Segoe UI",sans-serif}\n    .receipt{width:var(--receipt-width);min-width:var(--receipt-width);max-width:var(--receipt-width);padding:4mm;box-sizing:border-box;font-family:Arial,Tahoma,"Segoe UI",sans-serif;font-size:11px;line-height:1.35;color:#000;background:#fff;overflow:visible;height:auto;max-height:none}\n    .receipt .logo{width:17mm;height:17mm;object-fit:contain;display:block;margin:0 auto 2mm}.receipt h1{font-size:17px;margin:0 0 1mm;text-align:center}.receipt p{margin:0 0 1mm}.receipt header,.receipt footer{text-align:center}\n    .receipt .center{text-align:center}.receipt .en{direction:ltr}.receipt .meta,.receipt .totals{border-top:1px dashed #000;border-bottom:1px dashed #000;margin:3mm 0;padding:2mm 0}\n    .receipt .row{display:flex;justify-content:space-between;align-items:flex-start;gap:3mm;margin:1mm 0}.receipt .row span:first-child{flex:0 0 auto}.receipt .value{overflow-wrap:anywhere;word-break:break-word;text-align:end;max-width:45mm}\n    .receipt .invoice-number{max-width:100%;overflow-wrap:anywhere;word-break:break-word;white-space:normal;direction:ltr;text-align:left}\n    .receipt table{width:100%;border-collapse:collapse}.receipt td{padding:1.5mm 0;vertical-align:top;border-bottom:1px dotted #999}.receipt .qty{width:9mm;font-weight:bold}.receipt .item-name{overflow-wrap:anywhere;word-break:break-word}.receipt .money{text-align:end;white-space:nowrap}\n    .receipt small{display:block;color:#333;margin-top:1mm}.receipt .strong{font-size:14px;font-weight:bold}.receipt footer{margin-top:4mm;font-size:10px}\n  </style></head><body class="receipt receipt-document">\n    <main class="receipt">\n      <header>\n        <img class="logo" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3QgeD0iNTQiIHk9IjQ2IiB3aWR0aD0iNDA0IiBoZWlnaHQ9IjQyMCIgcng9Ijg2IiBmaWxsPSIjRjg2ODAwIi8+PHBhdGggZD0iTTEzNSAxMjhoMjQyYzIyIDAgNDAgMTggNDAgNDB2MTI4YzAgMzEtMjUgNTYtNTYgNTZoLTRjLTI3IDAtNDktMjItNDktNDl2LTg3SDIwNHY4N2MwIDI3LTIyIDQ5LTQ5IDQ5aC00Yy0zMSAwLTU2LTI1LTU2LTU2VjE2OGMwLTIyIDE4LTQwIDQwLTQwWiIgZmlsbD0iI0ZGRkZGRiIvPjxwYXRoIGQ9Ik0yMDkgMTc0aDExOGwtMjEgODZjLTUgMjEgMiA0MyAxOCA1OGwxMyAxMkgyMTBjMjgtMzAgNDEtNjUgMzktMTA1bC00MC01MVoiIGZpbGw9IiNGODY4MDAiLz48cGF0aCBkPSJNMjAzIDE2OGgxMzhsLTEyIDQ2SDIxNmwtMTMtNDZaIiBmaWxsPSIjRkY4QTFGIi8+PHBhdGggZD0iTTIyMiAyMjNoNTJjMyAyNSAwIDUzLTkgODMiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIxMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTI5NCAyMjRjNiAzMyA2IDY3IDAgMTAxTTMyMCAyMjRjNSAzNCA1IDY4IDAgMTAxTTM0NSAyMjRjNCAzMiA0IDY1IDAgOTgiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIxMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTIwOSAzNTdjLTggMjQtMjAgNDMtMzkgNTdoMTUzYy0xNS0xMy0yNC0zMS0yNi01N0gyMDlaIiBmaWxsPSIjRkZGRkZGIi8+PC9zdmc+" alt="Sheikh Al Kar logo">\n        <h1>شيخ الكار</h1>\n        <p class="en center">Sheikh Al Kar</p>\n        <p>الفرع الرئيسي</p>\n        <p>Ramallah, Palestine</p>\n        \n        <p>الرقم الضريبي: <span dir="ltr">310048229</span></p>\n        <p><strong>REPRINT / إعادة طباعة</strong></p>\n      </header>\n      <section class="meta">\n        <div class="row"><span>الفاتورة</span><strong class="value invoice-number">#MAIN-REG-MAIN-01-2026-000025</strong></div>\n        <div class="row"><span>التاريخ</span><strong class="value ">19‏/7‏/2026</strong></div>\n        <div class="row"><span>الوقت</span><strong class="value ">11:17 م</strong></div>\n        <div class="row"><span>الموظف</span><strong class="value ">Omar Khalil</strong></div>\n        <div class="row"><span>الزبون</span><strong class="value ">test</strong></div>\n        <div class="row"><span>هاتف الزبون</span><strong class="value ">0598746584</strong></div>\n        <div class="row"><span>طريقة الدفع</span><strong class="value ">نقداً</strong></div>\n        <div class="row"><span>العملة</span><strong class="value ">ILS</strong></div>\n        <div class="row"><span>المدفوع</span><strong class="value ">ILS 36.90</strong></div>\n        <div class="row"><span>طريقة التسليم</span><strong class="value ">توصيل</strong></div>\n        <div class="row"><span>نوع الطلب</span><strong class="value ">توصيل</strong></div>\n        <div class="row"><span>ملاحظات</span><strong class="value ">test</strong></div>\n      </section>\n      <table><tbody>\n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>تيراميسو</strong>\n        \n        \n        \n        \n        <small>سعر الوحدة: ILS 5.00</small>\n      </td>\n      <td class="money">ILS 5.00</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>مارغريتا</strong>\n        \n        <small>وسط</small>\n        \n        \n        <small>سعر الوحدة: ILS 9.00</small>\n      </td>\n      <td class="money">ILS 9.00</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>بيبروني حار</strong>\n        \n        <small>وسط</small>\n        \n        \n        <small>سعر الوحدة: ILS 10.50</small>\n      </td>\n      <td class="money">ILS 10.50</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>سلطة حلوم</strong>\n        \n        \n        \n        \n        <small>سعر الوحدة: ILS 7.75</small>\n      </td>\n      <td class="money">ILS 7.75</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>فستق مثلج</strong>\n        \n        <small>عادي</small>\n        \n        \n        <small>سعر الوحدة: ILS 4.25</small>\n      </td>\n      <td class="money">ILS 4.25</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>بطاطا محملة</strong>\n        \n        <small>صغير</small>\n        \n        \n        <small>سعر الوحدة: ILS 4.50</small>\n      </td>\n      <td class="money">ILS 4.50</td>\n    </tr>\n  </tbody></table>\n      <section class="totals">\n        <div class="row "><span>المجموع</span><strong class="value">ILS 41.00</strong></div>\n        <div class="row "><span>الخصم</span><strong class="value">- ILS 4.10</strong></div>\n        \n        \n        \n        <div class="row strong"><span>الإجمالي</span><strong class="value">ILS 36.90</strong></div>\n        <div class="row "><span>المدفوع</span><strong class="value">ILS 36.90</strong></div>\n        \n      </section>\n      <footer>\n        <strong>شكراً لزيارتكم</strong>\n        <p>الأسعار تشمل الضريبة</p>\n        <p>الرقم الضريبي: <span dir="ltr">310048229</span></p>\n        <p class="invoice-number">cmrs8m6jt0001w89neogjma52</p>\n      </footer>\n    </main></body></html>	1	W80	\N	PRINTED	1	5	\N	\N	invoice:cmrs8m6jt0001w89neogjma52:receipt:reprint:1784494708450	2026-07-19 20:58:28.452	2026-07-19 21:01:25.919	2026-07-19 21:01:26.085	2026-07-19 21:01:27.373	\N	\N	f	\N	\N	f
cmrsa6e0z0000wk9nvmo4ne85	cmr97q88n0000rs9nh4sethxg	cmrs0kvf90002t89nnfc21r9f	cmrs4db040007cg9nzhr3t2fc	cmrs8m6jt0001w89neogjma52	\N	cmrs8m6n9000aw89np74vlf3c	CUSTOMER_RECEIPT	HTML	<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>\n    :root{--receipt-width:60mm}@page{size:60mm auto;margin:0}*{box-sizing:border-box}\n    body.receipt-document{width:var(--receipt-width);margin:0;padding:0;background:#fff;color:#000;overflow:visible;font-family:Arial,Tahoma,"Segoe UI",sans-serif}\n    .receipt{width:var(--receipt-width);min-width:var(--receipt-width);max-width:var(--receipt-width);padding:4mm;box-sizing:border-box;font-family:Arial,Tahoma,"Segoe UI",sans-serif;font-size:11px;line-height:1.35;color:#000;background:#fff;overflow:visible;height:auto;max-height:none}\n    .receipt .logo{width:17mm;height:17mm;object-fit:contain;display:block;margin:0 auto 2mm}.receipt h1{font-size:17px;margin:0 0 1mm;text-align:center}.receipt p{margin:0 0 1mm}.receipt header,.receipt footer{text-align:center}\n    .receipt .center{text-align:center}.receipt .en{direction:ltr}.receipt .meta,.receipt .totals{border-top:1px dashed #000;border-bottom:1px dashed #000;margin:3mm 0;padding:2mm 0}\n    .receipt .row{display:flex;justify-content:space-between;align-items:flex-start;gap:3mm;margin:1mm 0}.receipt .row span:first-child{flex:0 0 auto}.receipt .value{overflow-wrap:anywhere;word-break:break-word;text-align:end;max-width:45mm}\n    .receipt .invoice-number{max-width:100%;overflow-wrap:anywhere;word-break:break-word;white-space:normal;direction:ltr;text-align:left}\n    .receipt table{width:100%;border-collapse:collapse}.receipt td{padding:1.5mm 0;vertical-align:top;border-bottom:1px dotted #999}.receipt .qty{width:9mm;font-weight:bold}.receipt .item-name{overflow-wrap:anywhere;word-break:break-word}.receipt .money{text-align:end;white-space:nowrap}\n    .receipt small{display:block;color:#333;margin-top:1mm}.receipt .strong{font-size:14px;font-weight:bold}.receipt footer{margin-top:4mm;font-size:10px}\n  </style></head><body class="receipt receipt-document">\n    <main class="receipt">\n      <header>\n        <img class="logo" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3QgeD0iNTQiIHk9IjQ2IiB3aWR0aD0iNDA0IiBoZWlnaHQ9IjQyMCIgcng9Ijg2IiBmaWxsPSIjRjg2ODAwIi8+PHBhdGggZD0iTTEzNSAxMjhoMjQyYzIyIDAgNDAgMTggNDAgNDB2MTI4YzAgMzEtMjUgNTYtNTYgNTZoLTRjLTI3IDAtNDktMjItNDktNDl2LTg3SDIwNHY4N2MwIDI3LTIyIDQ5LTQ5IDQ5aC00Yy0zMSAwLTU2LTI1LTU2LTU2VjE2OGMwLTIyIDE4LTQwIDQwLTQwWiIgZmlsbD0iI0ZGRkZGRiIvPjxwYXRoIGQ9Ik0yMDkgMTc0aDExOGwtMjEgODZjLTUgMjEgMiA0MyAxOCA1OGwxMyAxMkgyMTBjMjgtMzAgNDEtNjUgMzktMTA1bC00MC01MVoiIGZpbGw9IiNGODY4MDAiLz48cGF0aCBkPSJNMjAzIDE2OGgxMzhsLTEyIDQ2SDIxNmwtMTMtNDZaIiBmaWxsPSIjRkY4QTFGIi8+PHBhdGggZD0iTTIyMiAyMjNoNTJjMyAyNSAwIDUzLTkgODMiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIxMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTI5NCAyMjRjNiAzMyA2IDY3IDAgMTAxTTMyMCAyMjRjNSAzNCA1IDY4IDAgMTAxTTM0NSAyMjRjNCAzMiA0IDY1IDAgOTgiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIxMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTIwOSAzNTdjLTggMjQtMjAgNDMtMzkgNTdoMTUzYy0xNS0xMy0yNC0zMS0yNi01N0gyMDlaIiBmaWxsPSIjRkZGRkZGIi8+PC9zdmc+" alt="Sheikh Al Kar logo">\n        <h1>شيخ الكار</h1>\n        <p class="en center">Sheikh Al Kar</p>\n        <p>الفرع الرئيسي</p>\n        <p>Ramallah, Palestine</p>\n        \n        <p>الرقم الضريبي: <span dir="ltr">310048229</span></p>\n        <p><strong>REPRINT / إعادة طباعة</strong></p>\n      </header>\n      <section class="meta">\n        <div class="row"><span>الفاتورة</span><strong class="value invoice-number">#MAIN-REG-MAIN-01-2026-000025</strong></div>\n        <div class="row"><span>التاريخ</span><strong class="value ">19‏/7‏/2026</strong></div>\n        <div class="row"><span>الوقت</span><strong class="value ">11:17 م</strong></div>\n        <div class="row"><span>الموظف</span><strong class="value ">Omar Khalil</strong></div>\n        <div class="row"><span>الزبون</span><strong class="value ">test</strong></div>\n        <div class="row"><span>هاتف الزبون</span><strong class="value ">0598746584</strong></div>\n        <div class="row"><span>طريقة الدفع</span><strong class="value ">نقداً</strong></div>\n        <div class="row"><span>العملة</span><strong class="value ">ILS</strong></div>\n        <div class="row"><span>المدفوع</span><strong class="value ">ILS 36.90</strong></div>\n        <div class="row"><span>طريقة التسليم</span><strong class="value ">توصيل</strong></div>\n        <div class="row"><span>نوع الطلب</span><strong class="value ">توصيل</strong></div>\n        <div class="row"><span>ملاحظات</span><strong class="value ">test</strong></div>\n      </section>\n      <table><tbody>\n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>تيراميسو</strong>\n        \n        \n        \n        \n        <small>سعر الوحدة: ILS 5.00</small>\n      </td>\n      <td class="money">ILS 5.00</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>مارغريتا</strong>\n        \n        <small>وسط</small>\n        \n        \n        <small>سعر الوحدة: ILS 9.00</small>\n      </td>\n      <td class="money">ILS 9.00</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>بيبروني حار</strong>\n        \n        <small>وسط</small>\n        \n        \n        <small>سعر الوحدة: ILS 10.50</small>\n      </td>\n      <td class="money">ILS 10.50</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>سلطة حلوم</strong>\n        \n        \n        \n        \n        <small>سعر الوحدة: ILS 7.75</small>\n      </td>\n      <td class="money">ILS 7.75</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>فستق مثلج</strong>\n        \n        <small>عادي</small>\n        \n        \n        <small>سعر الوحدة: ILS 4.25</small>\n      </td>\n      <td class="money">ILS 4.25</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>بطاطا محملة</strong>\n        \n        <small>صغير</small>\n        \n        \n        <small>سعر الوحدة: ILS 4.50</small>\n      </td>\n      <td class="money">ILS 4.50</td>\n    </tr>\n  </tbody></table>\n      <section class="totals">\n        <div class="row "><span>المجموع</span><strong class="value">ILS 41.00</strong></div>\n        <div class="row "><span>الخصم</span><strong class="value">- ILS 4.10</strong></div>\n        \n        \n        \n        <div class="row strong"><span>الإجمالي</span><strong class="value">ILS 36.90</strong></div>\n        <div class="row "><span>المدفوع</span><strong class="value">ILS 36.90</strong></div>\n        \n      </section>\n      <footer>\n        <strong>شكراً لزيارتكم</strong>\n        <p>الأسعار تشمل الضريبة</p>\n        <p>الرقم الضريبي: <span dir="ltr">310048229</span></p>\n        <p class="invoice-number">cmrs8m6jt0001w89neogjma52</p>\n      </footer>\n    </main></body></html>	1	W80	\N	PRINTED	1	5	\N	\N	invoice:cmrs8m6jt0001w89neogjma52:receipt:reprint:1784494880377	2026-07-19 21:01:20.387	2026-07-19 21:01:25.926	2026-07-19 21:01:27.537	2026-07-19 21:01:28.783	\N	\N	f	\N	\N	f
cmrsa6zww0001wk9n80qqi1qb	cmr97q88n0000rs9nh4sethxg	cmrs0kvf90002t89nnfc21r9f	cmrs4db040007cg9nzhr3t2fc	cmrs8m6jt0001w89neogjma52	\N	cmrs8m6n9000aw89np74vlf3c	CUSTOMER_RECEIPT	HTML	<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>\n    :root{--receipt-width:60mm}@page{size:60mm auto;margin:0}*{box-sizing:border-box}\n    body.receipt-document{width:var(--receipt-width);margin:0;padding:0;background:#fff;color:#000;overflow:visible;font-family:Arial,Tahoma,"Segoe UI",sans-serif}\n    .receipt{width:var(--receipt-width);min-width:var(--receipt-width);max-width:var(--receipt-width);padding:4mm;box-sizing:border-box;font-family:Arial,Tahoma,"Segoe UI",sans-serif;font-size:11px;line-height:1.35;color:#000;background:#fff;overflow:visible;height:auto;max-height:none}\n    .receipt .logo{width:17mm;height:17mm;object-fit:contain;display:block;margin:0 auto 2mm}.receipt h1{font-size:17px;margin:0 0 1mm;text-align:center}.receipt p{margin:0 0 1mm}.receipt header,.receipt footer{text-align:center}\n    .receipt .center{text-align:center}.receipt .en{direction:ltr}.receipt .meta,.receipt .totals{border-top:1px dashed #000;border-bottom:1px dashed #000;margin:3mm 0;padding:2mm 0}\n    .receipt .row{display:flex;justify-content:space-between;align-items:flex-start;gap:3mm;margin:1mm 0}.receipt .row span:first-child{flex:0 0 auto}.receipt .value{overflow-wrap:anywhere;word-break:break-word;text-align:end;max-width:45mm}\n    .receipt .invoice-number{max-width:100%;overflow-wrap:anywhere;word-break:break-word;white-space:normal;direction:ltr;text-align:left}\n    .receipt table{width:100%;border-collapse:collapse}.receipt td{padding:1.5mm 0;vertical-align:top;border-bottom:1px dotted #999}.receipt .qty{width:9mm;font-weight:bold}.receipt .item-name{overflow-wrap:anywhere;word-break:break-word}.receipt .money{text-align:end;white-space:nowrap}\n    .receipt small{display:block;color:#333;margin-top:1mm}.receipt .strong{font-size:14px;font-weight:bold}.receipt footer{margin-top:4mm;font-size:10px}\n  </style></head><body class="receipt receipt-document">\n    <main class="receipt">\n      <header>\n        <img class="logo" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3QgeD0iNTQiIHk9IjQ2IiB3aWR0aD0iNDA0IiBoZWlnaHQ9IjQyMCIgcng9Ijg2IiBmaWxsPSIjRjg2ODAwIi8+PHBhdGggZD0iTTEzNSAxMjhoMjQyYzIyIDAgNDAgMTggNDAgNDB2MTI4YzAgMzEtMjUgNTYtNTYgNTZoLTRjLTI3IDAtNDktMjItNDktNDl2LTg3SDIwNHY4N2MwIDI3LTIyIDQ5LTQ5IDQ5aC00Yy0zMSAwLTU2LTI1LTU2LTU2VjE2OGMwLTIyIDE4LTQwIDQwLTQwWiIgZmlsbD0iI0ZGRkZGRiIvPjxwYXRoIGQ9Ik0yMDkgMTc0aDExOGwtMjEgODZjLTUgMjEgMiA0MyAxOCA1OGwxMyAxMkgyMTBjMjgtMzAgNDEtNjUgMzktMTA1bC00MC01MVoiIGZpbGw9IiNGODY4MDAiLz48cGF0aCBkPSJNMjAzIDE2OGgxMzhsLTEyIDQ2SDIxNmwtMTMtNDZaIiBmaWxsPSIjRkY4QTFGIi8+PHBhdGggZD0iTTIyMiAyMjNoNTJjMyAyNSAwIDUzLTkgODMiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIxMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTI5NCAyMjRjNiAzMyA2IDY3IDAgMTAxTTMyMCAyMjRjNSAzNCA1IDY4IDAgMTAxTTM0NSAyMjRjNCAzMiA0IDY1IDAgOTgiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIxMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTIwOSAzNTdjLTggMjQtMjAgNDMtMzkgNTdoMTUzYy0xNS0xMy0yNC0zMS0yNi01N0gyMDlaIiBmaWxsPSIjRkZGRkZGIi8+PC9zdmc+" alt="Sheikh Al Kar logo">\n        <h1>شيخ الكار</h1>\n        <p class="en center">Sheikh Al Kar</p>\n        <p>الفرع الرئيسي</p>\n        <p>Ramallah, Palestine</p>\n        \n        <p>الرقم الضريبي: <span dir="ltr">310048229</span></p>\n        <p><strong>REPRINT / إعادة طباعة</strong></p>\n      </header>\n      <section class="meta">\n        <div class="row"><span>الفاتورة</span><strong class="value invoice-number">#MAIN-REG-MAIN-01-2026-000025</strong></div>\n        <div class="row"><span>التاريخ</span><strong class="value ">19‏/7‏/2026</strong></div>\n        <div class="row"><span>الوقت</span><strong class="value ">11:17 م</strong></div>\n        <div class="row"><span>الموظف</span><strong class="value ">Omar Khalil</strong></div>\n        <div class="row"><span>الزبون</span><strong class="value ">test</strong></div>\n        <div class="row"><span>هاتف الزبون</span><strong class="value ">0598746584</strong></div>\n        <div class="row"><span>طريقة الدفع</span><strong class="value ">نقداً</strong></div>\n        <div class="row"><span>العملة</span><strong class="value ">ILS</strong></div>\n        <div class="row"><span>المدفوع</span><strong class="value ">ILS 36.90</strong></div>\n        <div class="row"><span>طريقة التسليم</span><strong class="value ">توصيل</strong></div>\n        <div class="row"><span>نوع الطلب</span><strong class="value ">توصيل</strong></div>\n        <div class="row"><span>ملاحظات</span><strong class="value ">test</strong></div>\n      </section>\n      <table><tbody>\n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>تيراميسو</strong>\n        \n        \n        \n        \n        <small>سعر الوحدة: ILS 5.00</small>\n      </td>\n      <td class="money">ILS 5.00</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>مارغريتا</strong>\n        \n        <small>وسط</small>\n        \n        \n        <small>سعر الوحدة: ILS 9.00</small>\n      </td>\n      <td class="money">ILS 9.00</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>بيبروني حار</strong>\n        \n        <small>وسط</small>\n        \n        \n        <small>سعر الوحدة: ILS 10.50</small>\n      </td>\n      <td class="money">ILS 10.50</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>سلطة حلوم</strong>\n        \n        \n        \n        \n        <small>سعر الوحدة: ILS 7.75</small>\n      </td>\n      <td class="money">ILS 7.75</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>فستق مثلج</strong>\n        \n        <small>عادي</small>\n        \n        \n        <small>سعر الوحدة: ILS 4.25</small>\n      </td>\n      <td class="money">ILS 4.25</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>بطاطا محملة</strong>\n        \n        <small>صغير</small>\n        \n        \n        <small>سعر الوحدة: ILS 4.50</small>\n      </td>\n      <td class="money">ILS 4.50</td>\n    </tr>\n  </tbody></table>\n      <section class="totals">\n        <div class="row "><span>المجموع</span><strong class="value">ILS 41.00</strong></div>\n        <div class="row "><span>الخصم</span><strong class="value">- ILS 4.10</strong></div>\n        \n        \n        \n        <div class="row strong"><span>الإجمالي</span><strong class="value">ILS 36.90</strong></div>\n        <div class="row "><span>المدفوع</span><strong class="value">ILS 36.90</strong></div>\n        \n      </section>\n      <footer>\n        <strong>شكراً لزيارتكم</strong>\n        <p>الأسعار تشمل الضريبة</p>\n        <p>الرقم الضريبي: <span dir="ltr">310048229</span></p>\n        <p class="invoice-number">cmrs8m6jt0001w89neogjma52</p>\n      </footer>\n    </main></body></html>	1	W80	\N	PRINTED	1	5	\N	\N	invoice:cmrs8m6jt0001w89neogjma52:receipt:reprint:1784494908748	2026-07-19 21:01:48.752	2026-07-19 21:01:48.827	2026-07-19 21:01:49.028	2026-07-19 21:01:50.355	\N	\N	f	\N	\N	f
cmrsa75yy0002wk9nswghey7y	cmr97q88n0000rs9nh4sethxg	cmrs0kvf90002t89nnfc21r9f	cmrs4db040007cg9nzhr3t2fc	cmrs8m6jt0001w89neogjma52	\N	cmrs8m6n9000aw89np74vlf3c	CUSTOMER_RECEIPT	HTML	<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>\n    :root{--receipt-width:60mm}@page{size:60mm auto;margin:0}*{box-sizing:border-box}\n    body.receipt-document{width:var(--receipt-width);margin:0;padding:0;background:#fff;color:#000;overflow:visible;font-family:Arial,Tahoma,"Segoe UI",sans-serif}\n    .receipt{width:var(--receipt-width);min-width:var(--receipt-width);max-width:var(--receipt-width);padding:4mm;box-sizing:border-box;font-family:Arial,Tahoma,"Segoe UI",sans-serif;font-size:11px;line-height:1.35;color:#000;background:#fff;overflow:visible;height:auto;max-height:none}\n    .receipt .logo{width:17mm;height:17mm;object-fit:contain;display:block;margin:0 auto 2mm}.receipt h1{font-size:17px;margin:0 0 1mm;text-align:center}.receipt p{margin:0 0 1mm}.receipt header,.receipt footer{text-align:center}\n    .receipt .center{text-align:center}.receipt .en{direction:ltr}.receipt .meta,.receipt .totals{border-top:1px dashed #000;border-bottom:1px dashed #000;margin:3mm 0;padding:2mm 0}\n    .receipt .row{display:flex;justify-content:space-between;align-items:flex-start;gap:3mm;margin:1mm 0}.receipt .row span:first-child{flex:0 0 auto}.receipt .value{overflow-wrap:anywhere;word-break:break-word;text-align:end;max-width:45mm}\n    .receipt .invoice-number{max-width:100%;overflow-wrap:anywhere;word-break:break-word;white-space:normal;direction:ltr;text-align:left}\n    .receipt table{width:100%;border-collapse:collapse}.receipt td{padding:1.5mm 0;vertical-align:top;border-bottom:1px dotted #999}.receipt .qty{width:9mm;font-weight:bold}.receipt .item-name{overflow-wrap:anywhere;word-break:break-word}.receipt .money{text-align:end;white-space:nowrap}\n    .receipt small{display:block;color:#333;margin-top:1mm}.receipt .strong{font-size:14px;font-weight:bold}.receipt footer{margin-top:4mm;font-size:10px}\n  </style></head><body class="receipt receipt-document">\n    <main class="receipt">\n      <header>\n        <img class="logo" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3QgeD0iNTQiIHk9IjQ2IiB3aWR0aD0iNDA0IiBoZWlnaHQ9IjQyMCIgcng9Ijg2IiBmaWxsPSIjRjg2ODAwIi8+PHBhdGggZD0iTTEzNSAxMjhoMjQyYzIyIDAgNDAgMTggNDAgNDB2MTI4YzAgMzEtMjUgNTYtNTYgNTZoLTRjLTI3IDAtNDktMjItNDktNDl2LTg3SDIwNHY4N2MwIDI3LTIyIDQ5LTQ5IDQ5aC00Yy0zMSAwLTU2LTI1LTU2LTU2VjE2OGMwLTIyIDE4LTQwIDQwLTQwWiIgZmlsbD0iI0ZGRkZGRiIvPjxwYXRoIGQ9Ik0yMDkgMTc0aDExOGwtMjEgODZjLTUgMjEgMiA0MyAxOCA1OGwxMyAxMkgyMTBjMjgtMzAgNDEtNjUgMzktMTA1bC00MC01MVoiIGZpbGw9IiNGODY4MDAiLz48cGF0aCBkPSJNMjAzIDE2OGgxMzhsLTEyIDQ2SDIxNmwtMTMtNDZaIiBmaWxsPSIjRkY4QTFGIi8+PHBhdGggZD0iTTIyMiAyMjNoNTJjMyAyNSAwIDUzLTkgODMiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIxMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTI5NCAyMjRjNiAzMyA2IDY3IDAgMTAxTTMyMCAyMjRjNSAzNCA1IDY4IDAgMTAxTTM0NSAyMjRjNCAzMiA0IDY1IDAgOTgiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIxMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTIwOSAzNTdjLTggMjQtMjAgNDMtMzkgNTdoMTUzYy0xNS0xMy0yNC0zMS0yNi01N0gyMDlaIiBmaWxsPSIjRkZGRkZGIi8+PC9zdmc+" alt="Sheikh Al Kar logo">\n        <h1>شيخ الكار</h1>\n        <p class="en center">Sheikh Al Kar</p>\n        <p>الفرع الرئيسي</p>\n        <p>Ramallah, Palestine</p>\n        \n        <p>الرقم الضريبي: <span dir="ltr">310048229</span></p>\n        <p><strong>REPRINT / إعادة طباعة</strong></p>\n      </header>\n      <section class="meta">\n        <div class="row"><span>الفاتورة</span><strong class="value invoice-number">#MAIN-REG-MAIN-01-2026-000025</strong></div>\n        <div class="row"><span>التاريخ</span><strong class="value ">19‏/7‏/2026</strong></div>\n        <div class="row"><span>الوقت</span><strong class="value ">11:17 م</strong></div>\n        <div class="row"><span>الموظف</span><strong class="value ">Omar Khalil</strong></div>\n        <div class="row"><span>الزبون</span><strong class="value ">test</strong></div>\n        <div class="row"><span>هاتف الزبون</span><strong class="value ">0598746584</strong></div>\n        <div class="row"><span>طريقة الدفع</span><strong class="value ">نقداً</strong></div>\n        <div class="row"><span>العملة</span><strong class="value ">ILS</strong></div>\n        <div class="row"><span>المدفوع</span><strong class="value ">ILS 36.90</strong></div>\n        <div class="row"><span>طريقة التسليم</span><strong class="value ">توصيل</strong></div>\n        <div class="row"><span>نوع الطلب</span><strong class="value ">توصيل</strong></div>\n        <div class="row"><span>ملاحظات</span><strong class="value ">test</strong></div>\n      </section>\n      <table><tbody>\n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>تيراميسو</strong>\n        \n        \n        \n        \n        <small>سعر الوحدة: ILS 5.00</small>\n      </td>\n      <td class="money">ILS 5.00</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>مارغريتا</strong>\n        \n        <small>وسط</small>\n        \n        \n        <small>سعر الوحدة: ILS 9.00</small>\n      </td>\n      <td class="money">ILS 9.00</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>بيبروني حار</strong>\n        \n        <small>وسط</small>\n        \n        \n        <small>سعر الوحدة: ILS 10.50</small>\n      </td>\n      <td class="money">ILS 10.50</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>سلطة حلوم</strong>\n        \n        \n        \n        \n        <small>سعر الوحدة: ILS 7.75</small>\n      </td>\n      <td class="money">ILS 7.75</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>فستق مثلج</strong>\n        \n        <small>عادي</small>\n        \n        \n        <small>سعر الوحدة: ILS 4.25</small>\n      </td>\n      <td class="money">ILS 4.25</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>بطاطا محملة</strong>\n        \n        <small>صغير</small>\n        \n        \n        <small>سعر الوحدة: ILS 4.50</small>\n      </td>\n      <td class="money">ILS 4.50</td>\n    </tr>\n  </tbody></table>\n      <section class="totals">\n        <div class="row "><span>المجموع</span><strong class="value">ILS 41.00</strong></div>\n        <div class="row "><span>الخصم</span><strong class="value">- ILS 4.10</strong></div>\n        \n        \n        \n        <div class="row strong"><span>الإجمالي</span><strong class="value">ILS 36.90</strong></div>\n        <div class="row "><span>المدفوع</span><strong class="value">ILS 36.90</strong></div>\n        \n      </section>\n      <footer>\n        <strong>شكراً لزيارتكم</strong>\n        <p>الأسعار تشمل الضريبة</p>\n        <p>الرقم الضريبي: <span dir="ltr">310048229</span></p>\n        <p class="invoice-number">cmrs8m6jt0001w89neogjma52</p>\n      </footer>\n    </main></body></html>	1	W80	\N	PRINTED	1	5	\N	\N	invoice:cmrs8m6jt0001w89neogjma52:receipt:reprint:1784494916599	2026-07-19 21:01:56.602	2026-07-19 21:01:56.648	2026-07-19 21:01:56.862	2026-07-19 21:01:58.157	\N	\N	f	\N	\N	f
cmrsa77ld0003wk9nzlu3bheu	cmr97q88n0000rs9nh4sethxg	cmrs0kvf90002t89nnfc21r9f	cmrs4db040007cg9nzhr3t2fc	cmrs8m6jt0001w89neogjma52	\N	cmrs8m6n9000aw89np74vlf3c	CUSTOMER_RECEIPT	HTML	<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>\n    :root{--receipt-width:60mm}@page{size:60mm auto;margin:0}*{box-sizing:border-box}\n    body.receipt-document{width:var(--receipt-width);margin:0;padding:0;background:#fff;color:#000;overflow:visible;font-family:Arial,Tahoma,"Segoe UI",sans-serif}\n    .receipt{width:var(--receipt-width);min-width:var(--receipt-width);max-width:var(--receipt-width);padding:4mm;box-sizing:border-box;font-family:Arial,Tahoma,"Segoe UI",sans-serif;font-size:11px;line-height:1.35;color:#000;background:#fff;overflow:visible;height:auto;max-height:none}\n    .receipt .logo{width:17mm;height:17mm;object-fit:contain;display:block;margin:0 auto 2mm}.receipt h1{font-size:17px;margin:0 0 1mm;text-align:center}.receipt p{margin:0 0 1mm}.receipt header,.receipt footer{text-align:center}\n    .receipt .center{text-align:center}.receipt .en{direction:ltr}.receipt .meta,.receipt .totals{border-top:1px dashed #000;border-bottom:1px dashed #000;margin:3mm 0;padding:2mm 0}\n    .receipt .row{display:flex;justify-content:space-between;align-items:flex-start;gap:3mm;margin:1mm 0}.receipt .row span:first-child{flex:0 0 auto}.receipt .value{overflow-wrap:anywhere;word-break:break-word;text-align:end;max-width:45mm}\n    .receipt .invoice-number{max-width:100%;overflow-wrap:anywhere;word-break:break-word;white-space:normal;direction:ltr;text-align:left}\n    .receipt table{width:100%;border-collapse:collapse}.receipt td{padding:1.5mm 0;vertical-align:top;border-bottom:1px dotted #999}.receipt .qty{width:9mm;font-weight:bold}.receipt .item-name{overflow-wrap:anywhere;word-break:break-word}.receipt .money{text-align:end;white-space:nowrap}\n    .receipt small{display:block;color:#333;margin-top:1mm}.receipt .strong{font-size:14px;font-weight:bold}.receipt footer{margin-top:4mm;font-size:10px}\n  </style></head><body class="receipt receipt-document">\n    <main class="receipt">\n      <header>\n        <img class="logo" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3QgeD0iNTQiIHk9IjQ2IiB3aWR0aD0iNDA0IiBoZWlnaHQ9IjQyMCIgcng9Ijg2IiBmaWxsPSIjRjg2ODAwIi8+PHBhdGggZD0iTTEzNSAxMjhoMjQyYzIyIDAgNDAgMTggNDAgNDB2MTI4YzAgMzEtMjUgNTYtNTYgNTZoLTRjLTI3IDAtNDktMjItNDktNDl2LTg3SDIwNHY4N2MwIDI3LTIyIDQ5LTQ5IDQ5aC00Yy0zMSAwLTU2LTI1LTU2LTU2VjE2OGMwLTIyIDE4LTQwIDQwLTQwWiIgZmlsbD0iI0ZGRkZGRiIvPjxwYXRoIGQ9Ik0yMDkgMTc0aDExOGwtMjEgODZjLTUgMjEgMiA0MyAxOCA1OGwxMyAxMkgyMTBjMjgtMzAgNDEtNjUgMzktMTA1bC00MC01MVoiIGZpbGw9IiNGODY4MDAiLz48cGF0aCBkPSJNMjAzIDE2OGgxMzhsLTEyIDQ2SDIxNmwtMTMtNDZaIiBmaWxsPSIjRkY4QTFGIi8+PHBhdGggZD0iTTIyMiAyMjNoNTJjMyAyNSAwIDUzLTkgODMiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIxMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTI5NCAyMjRjNiAzMyA2IDY3IDAgMTAxTTMyMCAyMjRjNSAzNCA1IDY4IDAgMTAxTTM0NSAyMjRjNCAzMiA0IDY1IDAgOTgiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIxMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTIwOSAzNTdjLTggMjQtMjAgNDMtMzkgNTdoMTUzYy0xNS0xMy0yNC0zMS0yNi01N0gyMDlaIiBmaWxsPSIjRkZGRkZGIi8+PC9zdmc+" alt="Sheikh Al Kar logo">\n        <h1>شيخ الكار</h1>\n        <p class="en center">Sheikh Al Kar</p>\n        <p>الفرع الرئيسي</p>\n        <p>Ramallah, Palestine</p>\n        \n        <p>الرقم الضريبي: <span dir="ltr">310048229</span></p>\n        <p><strong>REPRINT / إعادة طباعة</strong></p>\n      </header>\n      <section class="meta">\n        <div class="row"><span>الفاتورة</span><strong class="value invoice-number">#MAIN-REG-MAIN-01-2026-000025</strong></div>\n        <div class="row"><span>التاريخ</span><strong class="value ">19‏/7‏/2026</strong></div>\n        <div class="row"><span>الوقت</span><strong class="value ">11:17 م</strong></div>\n        <div class="row"><span>الموظف</span><strong class="value ">Omar Khalil</strong></div>\n        <div class="row"><span>الزبون</span><strong class="value ">test</strong></div>\n        <div class="row"><span>هاتف الزبون</span><strong class="value ">0598746584</strong></div>\n        <div class="row"><span>طريقة الدفع</span><strong class="value ">نقداً</strong></div>\n        <div class="row"><span>العملة</span><strong class="value ">ILS</strong></div>\n        <div class="row"><span>المدفوع</span><strong class="value ">ILS 36.90</strong></div>\n        <div class="row"><span>طريقة التسليم</span><strong class="value ">توصيل</strong></div>\n        <div class="row"><span>نوع الطلب</span><strong class="value ">توصيل</strong></div>\n        <div class="row"><span>ملاحظات</span><strong class="value ">test</strong></div>\n      </section>\n      <table><tbody>\n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>تيراميسو</strong>\n        \n        \n        \n        \n        <small>سعر الوحدة: ILS 5.00</small>\n      </td>\n      <td class="money">ILS 5.00</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>مارغريتا</strong>\n        \n        <small>وسط</small>\n        \n        \n        <small>سعر الوحدة: ILS 9.00</small>\n      </td>\n      <td class="money">ILS 9.00</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>بيبروني حار</strong>\n        \n        <small>وسط</small>\n        \n        \n        <small>سعر الوحدة: ILS 10.50</small>\n      </td>\n      <td class="money">ILS 10.50</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>سلطة حلوم</strong>\n        \n        \n        \n        \n        <small>سعر الوحدة: ILS 7.75</small>\n      </td>\n      <td class="money">ILS 7.75</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>فستق مثلج</strong>\n        \n        <small>عادي</small>\n        \n        \n        <small>سعر الوحدة: ILS 4.25</small>\n      </td>\n      <td class="money">ILS 4.25</td>\n    </tr>\n  \n    <tr>\n      <td class="qty">1x</td>\n      <td class="item-name">\n        <strong>بطاطا محملة</strong>\n        \n        <small>صغير</small>\n        \n        \n        <small>سعر الوحدة: ILS 4.50</small>\n      </td>\n      <td class="money">ILS 4.50</td>\n    </tr>\n  </tbody></table>\n      <section class="totals">\n        <div class="row "><span>المجموع</span><strong class="value">ILS 41.00</strong></div>\n        <div class="row "><span>الخصم</span><strong class="value">- ILS 4.10</strong></div>\n        \n        \n        \n        <div class="row strong"><span>الإجمالي</span><strong class="value">ILS 36.90</strong></div>\n        <div class="row "><span>المدفوع</span><strong class="value">ILS 36.90</strong></div>\n        \n      </section>\n      <footer>\n        <strong>شكراً لزيارتكم</strong>\n        <p>الأسعار تشمل الضريبة</p>\n        <p>الرقم الضريبي: <span dir="ltr">310048229</span></p>\n        <p class="invoice-number">cmrs8m6jt0001w89neogjma52</p>\n      </footer>\n    </main></body></html>	1	W80	\N	PRINTED	1	5	\N	\N	invoice:cmrs8m6jt0001w89neogjma52:receipt:reprint:1784494918704	2026-07-19 21:01:58.705	2026-07-19 21:01:58.741	2026-07-19 21:01:58.955	2026-07-19 21:02:00.347	\N	\N	f	\N	\N	f
\.


--
-- TOC entry 5780 (class 0 OID 465358)
-- Dependencies: 268
-- Data for Name: PrintPairingCode; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PrintPairingCode" (id, "branchId", "printDeviceId", "codeHash", "expiresAt", "usedAt", attempts, "createdById", "createdAt") FROM stdin;
cmrs0kbcr0000t89n3wyv61pr	cmr97q88n0000rs9nh4sethxg	cmrs0kvf90002t89nnfc21r9f	26984946a44c33fcf88bee310260e5c626321132b5b06a8ffce3ccd7a37fb36c	2026-07-19 16:42:13.903	2026-07-19 16:32:39.964	0	cmr97q8fb0001rs9nulxof0w3	2026-07-19 16:32:13.947
\.


--
-- TOC entry 5781 (class 0 OID 465373)
-- Dependencies: 269
-- Data for Name: PrinterConfiguration; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PrinterConfiguration" (id, "branchId", "printDeviceId", "printerType", "localPrinterName", "displayName", "paperWidth", "customWidthMm", copies, "autoPrint", enabled, "openCashDrawer", "createdAt", "updatedAt", "cashDrawerOpenBeforePrint", "cashDrawerPin", "cashDrawerPulseOff", "cashDrawerPulseOn") FROM stdin;
cmrs4db040007cg9nzhr3t2fc	cmr97q88n0000rs9nh4sethxg	cmrs0kvf90002t89nnfc21r9f	CASHIER	OneNote (Desktop)	OneNote (Desktop)	W80	\N	1	t	t	f	2026-07-19 18:18:45.364	2026-07-19 18:18:45.364	t	0	250	25
\.


--
-- TOC entry 5734 (class 0 OID 423891)
-- Dependencies: 222
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Product" (id, sku, price, "imageUrl", active, "categoryId", "createdAt", "updatedAt", "currentCost", "requiresPreparation", barcode, "deletedAt", "deletedBy") FROM stdin;
cmr97q8ga0005rs9njgs6t3wm	BRG-001	8.50	\N	t	cmr97q8fo0003rs9nzlwt08bq	2026-07-06 12:45:10.09	2026-07-17 08:54:32.881	1.38	t	\N	\N	\N
cmr97q8gj000crs9ndrraxovw	DRK-001	4.25	\N	t	cmr97q8fr0004rs9nehxt1w5w	2026-07-06 12:45:10.099	2026-07-17 08:54:32.882	0.13	t	\N	\N	\N
\.


--
-- TOC entry 5737 (class 0 OID 423930)
-- Dependencies: 225
-- Data for Name: ProductAddon; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProductAddon" (id, "nameEn", "nameAr", price, "productId") FROM stdin;
cmr97q8ge000ars9n1na3d7zm	Extra cheese	جبنة إضافية	1.00	cmr97q8ga0005rs9njgs6t3wm
cmr97q8ge000brs9njorjbg41	No onion	بدون بصل	0.00	cmr97q8ga0005rs9njgs6t3wm
cmr97q8gl000hrs9nbi8pdfgg	Extra shot	شوت إضافي	1.00	cmr97q8gj000crs9ndrraxovw
\.


--
-- TOC entry 5747 (class 0 OID 432630)
-- Dependencies: 235
-- Data for Name: ProductIngredient; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProductIngredient" (id, "productId", "ingredientId", "quantityUsed", "createdAt", "updatedAt") FROM stdin;
cmre6rfuw0009jg9n7997884s	cmr97q8gj000crs9ndrraxovw	cmre6rfud0005jg9nqq4w4jsl	0.0180	2026-07-10 00:16:57.608	2026-07-10 00:16:57.608
cmre6w4pj0000509nw0lwvk5t	cmr97q8ga0005rs9njgs6t3wm	cmre6rfua0004jg9n2dpks1wo	0.0400	2026-07-10 00:20:36.439	2026-07-10 00:20:36.439
cmre6w4pj0001509na5unmb1m	cmr97q8ga0005rs9njgs6t3wm	cmre6rfu70003jg9nhnm9vs1r	1.0000	2026-07-10 00:20:36.439	2026-07-10 00:20:36.439
cmre6w4pj0002509nvftajn5v	cmr97q8ga0005rs9njgs6t3wm	cmre6rfu10002jg9n30dv8l4x	10.0000	2026-07-10 00:20:36.439	2026-07-10 00:20:36.439
cmropc0x1000wdo9n3vqppin6	cmr97q8ga0005rs9njgs6t3wm	cmropc0wq000sdo9noz0hmpx8	0.1800	2026-07-17 08:54:32.869	2026-07-17 08:54:32.869
cmropc0x6000xdo9n3dl56r9o	cmr97q8ga0005rs9njgs6t3wm	cmropc0wu000tdo9niraaizkv	1.0000	2026-07-17 08:54:32.874	2026-07-17 08:54:32.874
cmropc0x8000ydo9nvpfgux5j	cmr97q8ga0005rs9njgs6t3wm	cmropc0ww000udo9n1zm8dw9h	0.0400	2026-07-17 08:54:32.876	2026-07-17 08:54:32.876
cmropc0xa000zdo9nztrb8poy	cmr97q8gj000crs9ndrraxovw	cmropc0wy000vdo9nju3pl4wk	0.0180	2026-07-17 08:54:32.878	2026-07-17 08:54:32.878
\.


--
-- TOC entry 5782 (class 0 OID 465399)
-- Dependencies: 270
-- Data for Name: ProductPrinterRoute; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProductPrinterRoute" (id, "productId", "printerConfigurationId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5736 (class 0 OID 423918)
-- Dependencies: 224
-- Data for Name: ProductSize; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProductSize" (id, "nameEn", "nameAr", "priceDelta", "productId") FROM stdin;
cmr97q8ge0008rs9nbs3gdgjf	Regular	عادي	0.00	cmr97q8ga0005rs9njgs6t3wm
cmr97q8ge0009rs9nqwejjhub	Double	دبل	2.50	cmr97q8ga0005rs9njgs6t3wm
cmr97q8gk000frs9nwlzq46dn	Regular	عادي	0.00	cmr97q8gj000crs9ndrraxovw
cmr97q8gk000grs9n7i4gxdqh	Large	كبير	1.00	cmr97q8gj000crs9ndrraxovw
\.


--
-- TOC entry 5735 (class 0 OID 423907)
-- Dependencies: 223
-- Data for Name: ProductTranslation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProductTranslation" (id, locale, name, description, "productId") FROM stdin;
cmr97q8gc0006rs9nzozievu7	en	Truffle Smash	Double beef, truffle aioli	cmr97q8ga0005rs9njgs6t3wm
cmr97q8gc0007rs9ng1uofxyz	ar	برغر الترفل	لحم مزدوج وصوص ترفل	cmr97q8ga0005rs9njgs6t3wm
cmr97q8gk000drs9nkz3lmli9	en	Iced Pistachio	Espresso, milk, pistachio	cmr97q8gj000crs9ndrraxovw
cmr97q8gk000ers9nm8dfat8x	ar	فستق �ثلج	إسبريسو وحليب وفستق	cmr97q8gj000crs9ndrraxovw
\.


--
-- TOC entry 5770 (class 0 OID 448087)
-- Dependencies: 258
-- Data for Name: PurchaseInvoice; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PurchaseInvoice" (id, "internalNumber", "officialNumber", "supplierId", "branchId", "purchaseDate", "dueDate", "currencyCode", "exchangeRateToBase", subtotal, discount, tax, "additionalCosts", total, "paidAmount", "remainingAmount", status, notes, "attachmentUrl", "createdById", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5771 (class 0 OID 448122)
-- Dependencies: 259
-- Data for Name: PurchaseInvoiceItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PurchaseInvoiceItem" (id, "purchaseInvoiceId", "productId", "itemNameSnapshot", quantity, unit, "unitPurchasePrice", discount, tax, total, "batchNumber", "expirationDate", "returnedQuantity") FROM stdin;
\.


--
-- TOC entry 5775 (class 0 OID 448194)
-- Dependencies: 263
-- Data for Name: PurchasePriceHistory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PurchasePriceHistory" (id, "productId", "purchaseInvoiceId", "unitCost", "currencyCode", "exchangeRateToBase", "createdAt") FROM stdin;
\.


--
-- TOC entry 5773 (class 0 OID 448161)
-- Dependencies: 261
-- Data for Name: PurchaseReturn; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PurchaseReturn" (id, "supplierId", "purchaseInvoiceId", reason, "returnDate", "refundMethod", "refundAmount", "createdById", "approvedById", status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5774 (class 0 OID 448182)
-- Dependencies: 262
-- Data for Name: PurchaseReturnItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PurchaseReturnItem" (id, "purchaseReturnId", "purchaseInvoiceItemId", quantity, "unitCost", reason) FROM stdin;
\.


--
-- TOC entry 5758 (class 0 OID 445997)
-- Dependencies: 246
-- Data for Name: ShiftCashCarryover; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ShiftCashCarryover" (id, "shiftId", "currencyCode", amount, "denominationBreakdown", "createdAt") FROM stdin;
\.


--
-- TOC entry 5757 (class 0 OID 445984)
-- Dependencies: 245
-- Data for Name: ShiftCashWithdrawal; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ShiftCashWithdrawal" (id, "shiftId", "currencyCode", amount, "createdAt") FROM stdin;
\.


--
-- TOC entry 5756 (class 0 OID 445967)
-- Dependencies: 244
-- Data for Name: ShiftClosingDenomination; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ShiftClosingDenomination" (id, "shiftId", "currencyCode", "denominationValue", "availableQty", "withdrawnQty", "remainingQty", "totalAmount", "withdrawnAmount", "remainingAmount") FROM stdin;
\.


--
-- TOC entry 5762 (class 0 OID 446070)
-- Dependencies: 250
-- Data for Name: ShiftDiscrepancy; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ShiftDiscrepancy" (id, "shiftId", "currencyCode", "expectedAmount", "actualAmount", "differenceAmount", "differenceBase", note, "createdAt") FROM stdin;
\.


--
-- TOC entry 5760 (class 0 OID 446029)
-- Dependencies: 248
-- Data for Name: ShiftExpense; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ShiftExpense" (id, "shiftId", category, amount, "currencyId", "currencyCode", "exchangeRateToBase", "convertedAmountBase", reason, notes, "receiptUrl", "employeeId", "createdAt", "cancelledAt", "approvalDate", "approvalStatus", "approvedById", "expenseCategoryId", "rejectionReason", "reversalOfId", source, "supplierId") FROM stdin;
\.


--
-- TOC entry 5763 (class 0 OID 446087)
-- Dependencies: 251
-- Data for Name: ShiftHandoverDiscrepancy; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ShiftHandoverDiscrepancy" (id, "shiftId", "previousShiftId", "currencyCode", "carryoverAmount", "actualOpeningAmount", "differenceAmount", "denominationDifferences", note, "createdAt") FROM stdin;
\.


--
-- TOC entry 5755 (class 0 OID 445954)
-- Dependencies: 243
-- Data for Name: ShiftOpeningDenomination; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ShiftOpeningDenomination" (id, "shiftId", "currencyCode", "denominationValue", quantity, "totalAmount") FROM stdin;
cmrp3jgqc0005rw9n0eusgdak	cmrp3jgpv0004rw9nanbdyo2l	ILS	200.00	2	400.00
cmrp3jgqc0006rw9n8aq3a7pj	cmrp3jgpv0004rw9nanbdyo2l	ILS	100.00	3	300.00
cmrp3jgqc0007rw9nbn0b7yj6	cmrp3jgpv0004rw9nanbdyo2l	ILS	50.00	4	200.00
cmrp3jgqc0008rw9np1w15an4	cmrp3jgpv0004rw9nanbdyo2l	ILS	20.00	10	200.00
cmrp3jgqc0009rw9na6qfx1ln	cmrp3jgpv0004rw9nanbdyo2l	ILS	10.00	10	100.00
cmrp3jgqc000arw9n0bxmchoe	cmrp3jgpv0004rw9nanbdyo2l	ILS	5.00	4	20.00
cmrp3jgqc000brw9ndu16o9yo	cmrp3jgpv0004rw9nanbdyo2l	ILS	2.00	2	4.00
cmrp3jgqc000crw9npjtce3sh	cmrp3jgpv0004rw9nanbdyo2l	ILS	1.00	30	30.00
cmrp3jgqd000drw9ngxby01z3	cmrp3jgpv0004rw9nanbdyo2l	USD	100.00	0	0.00
cmrp3jgqd000erw9nzo6nrjav	cmrp3jgpv0004rw9nanbdyo2l	USD	50.00	0	0.00
cmrp3jgqd000frw9nebewh4hq	cmrp3jgpv0004rw9nanbdyo2l	USD	20.00	0	0.00
cmrp3jgqd000grw9nfwzhvmoq	cmrp3jgpv0004rw9nanbdyo2l	USD	10.00	0	0.00
cmrp3jgqd000hrw9ndjqzcnkm	cmrp3jgpv0004rw9nanbdyo2l	USD	5.00	0	0.00
cmrp3jgqd000irw9nul0xdwee	cmrp3jgpv0004rw9nanbdyo2l	USD	1.00	0	0.00
cmrp3jgqd000jrw9n2jed9zn9	cmrp3jgpv0004rw9nanbdyo2l	JOD	50.00	0	0.00
cmrp3jgqd000krw9nbkrrenyh	cmrp3jgpv0004rw9nanbdyo2l	JOD	20.00	0	0.00
cmrp3jgqd000lrw9n4gh85snk	cmrp3jgpv0004rw9nanbdyo2l	JOD	10.00	0	0.00
cmrp3jgqd000mrw9nqszc9v6d	cmrp3jgpv0004rw9nanbdyo2l	JOD	5.00	0	0.00
cmrp3jgqd000nrw9n8bnuc2lt	cmrp3jgpv0004rw9nanbdyo2l	JOD	1.00	0	0.00
\.


--
-- TOC entry 5765 (class 0 OID 446125)
-- Dependencies: 253
-- Data for Name: ShiftReport; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ShiftReport" (id, "shiftId", reference, "reportData", "pdfUrl", "generatedAt", "generatedById") FROM stdin;
\.


--
-- TOC entry 5761 (class 0 OID 446048)
-- Dependencies: 249
-- Data for Name: ShiftReturn; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ShiftReturn" (id, "shiftId", "originalInvoiceNumber", "returnNumber", "returnedItems", amount, "currencyId", "currencyCode", "exchangeRateToBase", "convertedAmountBase", "refundMethod", reason, "employeeId", "createdAt") FROM stdin;
\.


--
-- TOC entry 5769 (class 0 OID 448071)
-- Dependencies: 257
-- Data for Name: Supplier; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Supplier" (id, name, "contactPerson", phone, email, address, "taxNumber", notes, "currentBalance", active, "deletedAt", "deletedBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5772 (class 0 OID 448142)
-- Dependencies: 260
-- Data for Name: SupplierPayment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SupplierPayment" (id, "supplierId", "purchaseInvoiceId", "branchId", amount, "currencyCode", "exchangeRateToBase", source, method, "accountName", "referenceNumber", "paymentDate", notes, "attachmentUrl", "createdById", "createdAt") FROM stdin;
\.


--
-- TOC entry 5732 (class 0 OID 423857)
-- Dependencies: 220
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, name, email, "passwordHash", role, active, "branchId", "createdAt", "updatedAt", "baseSalary", "deletedAt", "deletedBy", "failedLoginCount", "forcePasswordChange", "lastLoginAt", "lockedUntil", "sessionVersion") FROM stdin;
cmr97q8fk0002rs9nw154pmah	Omar Khalil	cashier@noura.test	$2b$12$vazVduHAriWz/co6DsAGSuaFRzV6RblxTG8kAAW10FLcYZYlgzha6	CASHIER	t	cmr97q88n0000rs9nh4sethxg	2026-07-06 12:45:10.064	2026-10-22 06:58:46.307	0.00	\N	\N	0	f	2026-10-22 06:58:46.291	\N	1
cmr97q8fb0001rs9nulxof0w3	Maya Haddad	admin@noura.test	$2b$12$vazVduHAriWz/co6DsAGSuaFRzV6RblxTG8kAAW10FLcYZYlgzha6	ADMIN	t	cmr97q88n0000rs9nh4sethxg	2026-07-06 12:45:10.055	2026-10-22 07:00:02.663	0.00	\N	\N	0	f	2026-10-22 07:00:02.662	\N	1
\.


--
-- TOC entry 5744 (class 0 OID 424033)
-- Dependencies: 232
-- Data for Name: _DiscountCategories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_DiscountCategories" ("A", "B") FROM stdin;
\.


--
-- TOC entry 5745 (class 0 OID 424042)
-- Dependencies: 233
-- Data for Name: _DiscountProducts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_DiscountProducts" ("A", "B") FROM stdin;
\.


--
-- TOC entry 5785 (class 0 OID 468620)
-- Dependencies: 273
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
6d220589-80c3-4073-b0d3-0e6ec7a8a294	95c4e52431ba3eb041649d29c1a6ff49a2640e6e4997caea4a05bf1c4849d091	2026-07-19 20:48:33.696817+03	20260717191000_sync_existing_database_to_financial_schema		\N	2026-07-19 20:48:33.696817+03	0
969a86fb-b7c4-47f7-8840-e50aeaa42d46	48d23092b708c34880d1995243ee54c23bb76aea31cd204eec85bb717ceaba3e	2026-07-19 20:49:20.366142+03	20260717180000_erp_financial_controls_suppliers		\N	2026-07-19 20:49:20.366142+03	0
c4d3ede1-00d1-49fb-9e4d-895bc3084940	9898ec2a834ce64b438a996df8eda57c8a7b7a36be30e70894046f8ca294832f	2026-07-19 20:50:21.800625+03	20260717202000_invoice_customer_totals		\N	2026-07-19 20:50:21.800625+03	0
fa2a425e-5ece-4450-94a3-ae5379783f8d	81755c8c2b6edc02f563aa74802fcb6419dc5f484bb91e38a0de53a5e46ec405	2026-07-19 20:50:35.377992+03	20260719130000_printing_system		\N	2026-07-19 20:50:35.377992+03	0
6e2058be-a797-453e-a882-8ebcd4edd37c	6f2d2e79cfa54c25521dd2da784ac81c905ab58dc3dacd2ae9be36a6e928d857	2026-07-19 20:50:48.894865+03	20260719203000_add_cash_drawer_to_print_job		\N	2026-07-19 20:50:48.894865+03	0
51f27c1b-3cd7-4f34-ad0d-fd26294e440d	edab85757d797fa3e623e0fdee138bd1273f1a962511e412da5af8089e067437	2026-07-19 20:51:01.598279+03	20260719203500_add_cash_drawer_config		\N	2026-07-19 20:51:01.598279+03	0
60ab5339-00c1-4719-9d4d-2eb3f4b869e2	8215eed9de1450cc532c046da24c860e92e9a7d784f73009812eb3e95151d264	2026-07-19 20:51:04.041772+03	20260719210000_add_drawer_error_message		\N	2026-07-19 20:51:04.041772+03	0
\.


--
-- TOC entry 5342 (class 2606 OID 424032)
-- Name: AuditLog AuditLog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_pkey" PRIMARY KEY (id);


--
-- TOC entry 5301 (class 2606 OID 423856)
-- Name: Branch Branch_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Branch"
    ADD CONSTRAINT "Branch_pkey" PRIMARY KEY (id);


--
-- TOC entry 5460 (class 2606 OID 448241)
-- Name: CashAdjustment CashAdjustment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CashAdjustment"
    ADD CONSTRAINT "CashAdjustment_pkey" PRIMARY KEY (id);


--
-- TOC entry 5423 (class 2606 OID 446150)
-- Name: CashNotification CashNotification_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CashNotification"
    ADD CONSTRAINT "CashNotification_pkey" PRIMARY KEY (id);


--
-- TOC entry 5377 (class 2606 OID 445929)
-- Name: CashRegister CashRegister_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CashRegister"
    ADD CONSTRAINT "CashRegister_pkey" PRIMARY KEY (id);


--
-- TOC entry 5381 (class 2606 OID 445953)
-- Name: CashShift CashShift_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CashShift"
    ADD CONSTRAINT "CashShift_pkey" PRIMARY KEY (id);


--
-- TOC entry 5485 (class 2606 OID 465424)
-- Name: CategoryPrinterRoute CategoryPrinterRoute_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CategoryPrinterRoute"
    ADD CONSTRAINT "CategoryPrinterRoute_pkey" PRIMARY KEY (id);


--
-- TOC entry 5306 (class 2606 OID 423890)
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- TOC entry 5372 (class 2606 OID 445913)
-- Name: CurrencyDenomination CurrencyDenomination_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CurrencyDenomination"
    ADD CONSTRAINT "CurrencyDenomination_pkey" PRIMARY KEY (id);


--
-- TOC entry 5366 (class 2606 OID 445881)
-- Name: Currency Currency_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Currency"
    ADD CONSTRAINT "Currency_pkey" PRIMARY KEY (id);


--
-- TOC entry 5319 (class 2606 OID 423960)
-- Name: DiscountCampaign DiscountCampaign_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DiscountCampaign"
    ADD CONSTRAINT "DiscountCampaign_pkey" PRIMARY KEY (id);


--
-- TOC entry 5369 (class 2606 OID 445895)
-- Name: ExchangeRate ExchangeRate_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ExchangeRate"
    ADD CONSTRAINT "ExchangeRate_pkey" PRIMARY KEY (id);


--
-- TOC entry 5430 (class 2606 OID 448070)
-- Name: ExpenseCategoryMaster ExpenseCategoryMaster_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ExpenseCategoryMaster"
    ADD CONSTRAINT "ExpenseCategoryMaster_pkey" PRIMARY KEY (id);


--
-- TOC entry 5350 (class 2606 OID 432629)
-- Name: Ingredient Ingredient_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Ingredient"
    ADD CONSTRAINT "Ingredient_pkey" PRIMARY KEY (id);


--
-- TOC entry 5456 (class 2606 OID 448223)
-- Name: InventoryMovement InventoryMovement_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InventoryMovement"
    ADD CONSTRAINT "InventoryMovement_pkey" PRIMARY KEY (id);


--
-- TOC entry 5335 (class 2606 OID 424006)
-- Name: InvoiceItemAddon InvoiceItemAddon_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InvoiceItemAddon"
    ADD CONSTRAINT "InvoiceItemAddon_pkey" PRIMARY KEY (id);


--
-- TOC entry 5333 (class 2606 OID 423995)
-- Name: InvoiceItem InvoiceItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InvoiceItem"
    ADD CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY (id);


--
-- TOC entry 5397 (class 2606 OID 446028)
-- Name: InvoicePayment InvoicePayment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InvoicePayment"
    ADD CONSTRAINT "InvoicePayment_pkey" PRIMARY KEY (id);


--
-- TOC entry 5464 (class 2606 OID 448257)
-- Name: InvoiceSequence InvoiceSequence_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InvoiceSequence"
    ADD CONSTRAINT "InvoiceSequence_pkey" PRIMARY KEY (id);


--
-- TOC entry 5329 (class 2606 OID 423982)
-- Name: Invoice Invoice_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_pkey" PRIMARY KEY (id);


--
-- TOC entry 5417 (class 2606 OID 446124)
-- Name: KitchenOrder KitchenOrder_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KitchenOrder"
    ADD CONSTRAINT "KitchenOrder_pkey" PRIMARY KEY (id);


--
-- TOC entry 5359 (class 2606 OID 432662)
-- Name: OperatingExpense OperatingExpense_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OperatingExpense"
    ADD CONSTRAINT "OperatingExpense_pkey" PRIMARY KEY (id);


--
-- TOC entry 5426 (class 2606 OID 448049)
-- Name: PasswordResetToken PasswordResetToken_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PasswordResetToken"
    ADD CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY (id);


--
-- TOC entry 5338 (class 2606 OID 424020)
-- Name: Payment Payment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_pkey" PRIMARY KEY (id);


--
-- TOC entry 5363 (class 2606 OID 432717)
-- Name: PayrollRecord PayrollRecord_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PayrollRecord"
    ADD CONSTRAINT "PayrollRecord_pkey" PRIMARY KEY (id);


--
-- TOC entry 5469 (class 2606 OID 465357)
-- Name: PrintDevice PrintDevice_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PrintDevice"
    ADD CONSTRAINT "PrintDevice_pkey" PRIMARY KEY (id);


--
-- TOC entry 5492 (class 2606 OID 465450)
-- Name: PrintJob PrintJob_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PrintJob"
    ADD CONSTRAINT "PrintJob_pkey" PRIMARY KEY (id);


--
-- TOC entry 5473 (class 2606 OID 465372)
-- Name: PrintPairingCode PrintPairingCode_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PrintPairingCode"
    ADD CONSTRAINT "PrintPairingCode_pkey" PRIMARY KEY (id);


--
-- TOC entry 5477 (class 2606 OID 465398)
-- Name: PrinterConfiguration PrinterConfiguration_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PrinterConfiguration"
    ADD CONSTRAINT "PrinterConfiguration_pkey" PRIMARY KEY (id);


--
-- TOC entry 5317 (class 2606 OID 423941)
-- Name: ProductAddon ProductAddon_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductAddon"
    ADD CONSTRAINT "ProductAddon_pkey" PRIMARY KEY (id);


--
-- TOC entry 5352 (class 2606 OID 432643)
-- Name: ProductIngredient ProductIngredient_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductIngredient"
    ADD CONSTRAINT "ProductIngredient_pkey" PRIMARY KEY (id);


--
-- TOC entry 5480 (class 2606 OID 465411)
-- Name: ProductPrinterRoute ProductPrinterRoute_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductPrinterRoute"
    ADD CONSTRAINT "ProductPrinterRoute_pkey" PRIMARY KEY (id);


--
-- TOC entry 5315 (class 2606 OID 423929)
-- Name: ProductSize ProductSize_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductSize"
    ADD CONSTRAINT "ProductSize_pkey" PRIMARY KEY (id);


--
-- TOC entry 5312 (class 2606 OID 423917)
-- Name: ProductTranslation ProductTranslation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductTranslation"
    ADD CONSTRAINT "ProductTranslation_pkey" PRIMARY KEY (id);


--
-- TOC entry 5309 (class 2606 OID 423906)
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- TOC entry 5443 (class 2606 OID 448141)
-- Name: PurchaseInvoiceItem PurchaseInvoiceItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseInvoiceItem"
    ADD CONSTRAINT "PurchaseInvoiceItem_pkey" PRIMARY KEY (id);


--
-- TOC entry 5438 (class 2606 OID 448121)
-- Name: PurchaseInvoice PurchaseInvoice_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseInvoice"
    ADD CONSTRAINT "PurchaseInvoice_pkey" PRIMARY KEY (id);


--
-- TOC entry 5453 (class 2606 OID 448207)
-- Name: PurchasePriceHistory PurchasePriceHistory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchasePriceHistory"
    ADD CONSTRAINT "PurchasePriceHistory_pkey" PRIMARY KEY (id);


--
-- TOC entry 5451 (class 2606 OID 448193)
-- Name: PurchaseReturnItem PurchaseReturnItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseReturnItem"
    ADD CONSTRAINT "PurchaseReturnItem_pkey" PRIMARY KEY (id);


--
-- TOC entry 5449 (class 2606 OID 448181)
-- Name: PurchaseReturn PurchaseReturn_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseReturn"
    ADD CONSTRAINT "PurchaseReturn_pkey" PRIMARY KEY (id);


--
-- TOC entry 5394 (class 2606 OID 446009)
-- Name: ShiftCashCarryover ShiftCashCarryover_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ShiftCashCarryover"
    ADD CONSTRAINT "ShiftCashCarryover_pkey" PRIMARY KEY (id);


--
-- TOC entry 5392 (class 2606 OID 445996)
-- Name: ShiftCashWithdrawal ShiftCashWithdrawal_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ShiftCashWithdrawal"
    ADD CONSTRAINT "ShiftCashWithdrawal_pkey" PRIMARY KEY (id);


--
-- TOC entry 5389 (class 2606 OID 445983)
-- Name: ShiftClosingDenomination ShiftClosingDenomination_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ShiftClosingDenomination"
    ADD CONSTRAINT "ShiftClosingDenomination_pkey" PRIMARY KEY (id);


--
-- TOC entry 5408 (class 2606 OID 446086)
-- Name: ShiftDiscrepancy ShiftDiscrepancy_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ShiftDiscrepancy"
    ADD CONSTRAINT "ShiftDiscrepancy_pkey" PRIMARY KEY (id);


--
-- TOC entry 5401 (class 2606 OID 446047)
-- Name: ShiftExpense ShiftExpense_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ShiftExpense"
    ADD CONSTRAINT "ShiftExpense_pkey" PRIMARY KEY (id);


--
-- TOC entry 5411 (class 2606 OID 446102)
-- Name: ShiftHandoverDiscrepancy ShiftHandoverDiscrepancy_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ShiftHandoverDiscrepancy"
    ADD CONSTRAINT "ShiftHandoverDiscrepancy_pkey" PRIMARY KEY (id);


--
-- TOC entry 5386 (class 2606 OID 445966)
-- Name: ShiftOpeningDenomination ShiftOpeningDenomination_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ShiftOpeningDenomination"
    ADD CONSTRAINT "ShiftOpeningDenomination_pkey" PRIMARY KEY (id);


--
-- TOC entry 5419 (class 2606 OID 446137)
-- Name: ShiftReport ShiftReport_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ShiftReport"
    ADD CONSTRAINT "ShiftReport_pkey" PRIMARY KEY (id);


--
-- TOC entry 5404 (class 2606 OID 446069)
-- Name: ShiftReturn ShiftReturn_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ShiftReturn"
    ADD CONSTRAINT "ShiftReturn_pkey" PRIMARY KEY (id);


--
-- TOC entry 5446 (class 2606 OID 448160)
-- Name: SupplierPayment SupplierPayment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SupplierPayment"
    ADD CONSTRAINT "SupplierPayment_pkey" PRIMARY KEY (id);


--
-- TOC entry 5433 (class 2606 OID 448086)
-- Name: Supplier Supplier_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Supplier"
    ADD CONSTRAINT "Supplier_pkey" PRIMARY KEY (id);


--
-- TOC entry 5304 (class 2606 OID 423873)
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- TOC entry 5344 (class 2606 OID 424041)
-- Name: _DiscountCategories _DiscountCategories_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_DiscountCategories"
    ADD CONSTRAINT "_DiscountCategories_AB_pkey" PRIMARY KEY ("A", "B");


--
-- TOC entry 5347 (class 2606 OID 424050)
-- Name: _DiscountProducts _DiscountProducts_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_DiscountProducts"
    ADD CONSTRAINT "_DiscountProducts_AB_pkey" PRIMARY KEY ("A", "B");


--
-- TOC entry 5496 (class 2606 OID 468633)
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 5339 (class 1259 OID 448274)
-- Name: AuditLog_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AuditLog_createdAt_idx" ON public."AuditLog" USING btree ("createdAt");


--
-- TOC entry 5340 (class 1259 OID 424059)
-- Name: AuditLog_entityType_entityId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AuditLog_entityType_entityId_idx" ON public."AuditLog" USING btree ("entityType", "entityId");


--
-- TOC entry 5299 (class 1259 OID 424051)
-- Name: Branch_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Branch_code_key" ON public."Branch" USING btree (code);


--
-- TOC entry 5461 (class 1259 OID 448272)
-- Name: CashAdjustment_shiftId_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "CashAdjustment_shiftId_createdAt_idx" ON public."CashAdjustment" USING btree ("shiftId", "createdAt");


--
-- TOC entry 5424 (class 1259 OID 446174)
-- Name: CashNotification_userId_readAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "CashNotification_userId_readAt_idx" ON public."CashNotification" USING btree ("userId", "readAt");


--
-- TOC entry 5373 (class 1259 OID 446155)
-- Name: CashRegister_branchId_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "CashRegister_branchId_active_idx" ON public."CashRegister" USING btree ("branchId", active);


--
-- TOC entry 5374 (class 1259 OID 448275)
-- Name: CashRegister_branchId_number_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "CashRegister_branchId_number_key" ON public."CashRegister" USING btree ("branchId", number);


--
-- TOC entry 5375 (class 1259 OID 446154)
-- Name: CashRegister_number_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "CashRegister_number_key" ON public."CashRegister" USING btree (number);


--
-- TOC entry 5378 (class 1259 OID 446159)
-- Name: CashShift_branchId_openedAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "CashShift_branchId_openedAt_idx" ON public."CashShift" USING btree ("branchId", "openedAt");


--
-- TOC entry 5379 (class 1259 OID 446158)
-- Name: CashShift_employeeId_openedAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "CashShift_employeeId_openedAt_idx" ON public."CashShift" USING btree ("employeeId", "openedAt");


--
-- TOC entry 5382 (class 1259 OID 446157)
-- Name: CashShift_registerId_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "CashShift_registerId_status_idx" ON public."CashShift" USING btree ("registerId", status);


--
-- TOC entry 5383 (class 1259 OID 446156)
-- Name: CashShift_shiftNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "CashShift_shiftNumber_key" ON public."CashShift" USING btree ("shiftNumber");


--
-- TOC entry 5384 (class 1259 OID 448276)
-- Name: CashShift_status_openedAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "CashShift_status_openedAt_idx" ON public."CashShift" USING btree (status, "openedAt");


--
-- TOC entry 5483 (class 1259 OID 465461)
-- Name: CategoryPrinterRoute_categoryId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "CategoryPrinterRoute_categoryId_key" ON public."CategoryPrinterRoute" USING btree ("categoryId");


--
-- TOC entry 5486 (class 1259 OID 465462)
-- Name: CategoryPrinterRoute_printerConfigurationId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "CategoryPrinterRoute_printerConfigurationId_idx" ON public."CategoryPrinterRoute" USING btree ("printerConfigurationId");


--
-- TOC entry 5370 (class 1259 OID 446153)
-- Name: CurrencyDenomination_currencyId_value_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "CurrencyDenomination_currencyId_value_key" ON public."CurrencyDenomination" USING btree ("currencyId", value);


--
-- TOC entry 5364 (class 1259 OID 446151)
-- Name: Currency_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Currency_code_key" ON public."Currency" USING btree (code);


--
-- TOC entry 5367 (class 1259 OID 446152)
-- Name: ExchangeRate_currencyId_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ExchangeRate_currencyId_active_idx" ON public."ExchangeRate" USING btree ("currencyId", active);


--
-- TOC entry 5457 (class 1259 OID 448270)
-- Name: InventoryMovement_productId_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "InventoryMovement_productId_createdAt_idx" ON public."InventoryMovement" USING btree ("productId", "createdAt");


--
-- TOC entry 5458 (class 1259 OID 448271)
-- Name: InventoryMovement_referenceType_referenceId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "InventoryMovement_referenceType_referenceId_idx" ON public."InventoryMovement" USING btree ("referenceType", "referenceId");


--
-- TOC entry 5395 (class 1259 OID 446162)
-- Name: InvoicePayment_invoiceId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "InvoicePayment_invoiceId_idx" ON public."InvoicePayment" USING btree ("invoiceId");


--
-- TOC entry 5398 (class 1259 OID 446163)
-- Name: InvoicePayment_shiftId_method_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "InvoicePayment_shiftId_method_idx" ON public."InvoicePayment" USING btree ("shiftId", method);


--
-- TOC entry 5462 (class 1259 OID 448273)
-- Name: InvoiceSequence_branchId_registerId_year_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "InvoiceSequence_branchId_registerId_year_key" ON public."InvoiceSequence" USING btree ("branchId", "registerId", year);


--
-- TOC entry 5320 (class 1259 OID 448281)
-- Name: Invoice_branchId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Invoice_branchId_idx" ON public."Invoice" USING btree ("branchId");


--
-- TOC entry 5321 (class 1259 OID 424057)
-- Name: Invoice_cashierId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Invoice_cashierId_idx" ON public."Invoice" USING btree ("cashierId");


--
-- TOC entry 5322 (class 1259 OID 448279)
-- Name: Invoice_clientTransactionId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Invoice_clientTransactionId_key" ON public."Invoice" USING btree ("clientTransactionId");


--
-- TOC entry 5323 (class 1259 OID 448280)
-- Name: Invoice_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Invoice_createdAt_idx" ON public."Invoice" USING btree ("createdAt");


--
-- TOC entry 5324 (class 1259 OID 448278)
-- Name: Invoice_idempotencyKey_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Invoice_idempotencyKey_key" ON public."Invoice" USING btree ("idempotencyKey");


--
-- TOC entry 5325 (class 1259 OID 424055)
-- Name: Invoice_number_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Invoice_number_key" ON public."Invoice" USING btree (number);


--
-- TOC entry 5326 (class 1259 OID 448277)
-- Name: Invoice_officialNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Invoice_officialNumber_key" ON public."Invoice" USING btree ("officialNumber");


--
-- TOC entry 5327 (class 1259 OID 448283)
-- Name: Invoice_orderType_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Invoice_orderType_idx" ON public."Invoice" USING btree ("orderType");


--
-- TOC entry 5330 (class 1259 OID 446175)
-- Name: Invoice_shiftId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Invoice_shiftId_idx" ON public."Invoice" USING btree ("shiftId");


--
-- TOC entry 5331 (class 1259 OID 448282)
-- Name: Invoice_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Invoice_status_idx" ON public."Invoice" USING btree (status);


--
-- TOC entry 5413 (class 1259 OID 446171)
-- Name: KitchenOrder_branchId_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "KitchenOrder_branchId_status_idx" ON public."KitchenOrder" USING btree ("branchId", status);


--
-- TOC entry 5414 (class 1259 OID 446170)
-- Name: KitchenOrder_invoiceId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "KitchenOrder_invoiceId_key" ON public."KitchenOrder" USING btree ("invoiceId");


--
-- TOC entry 5415 (class 1259 OID 446169)
-- Name: KitchenOrder_orderNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "KitchenOrder_orderNumber_key" ON public."KitchenOrder" USING btree ("orderNumber");


--
-- TOC entry 5354 (class 1259 OID 448285)
-- Name: OperatingExpense_approvalStatus_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "OperatingExpense_approvalStatus_createdAt_idx" ON public."OperatingExpense" USING btree ("approvalStatus", "createdAt");


--
-- TOC entry 5355 (class 1259 OID 448284)
-- Name: OperatingExpense_branchId_expenseDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "OperatingExpense_branchId_expenseDate_idx" ON public."OperatingExpense" USING btree ("branchId", "expenseDate");


--
-- TOC entry 5356 (class 1259 OID 432664)
-- Name: OperatingExpense_expenseDate_category_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "OperatingExpense_expenseDate_category_idx" ON public."OperatingExpense" USING btree ("expenseDate", category);


--
-- TOC entry 5357 (class 1259 OID 432720)
-- Name: OperatingExpense_payrollRecordId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "OperatingExpense_payrollRecordId_key" ON public."OperatingExpense" USING btree ("payrollRecordId");


--
-- TOC entry 5427 (class 1259 OID 448258)
-- Name: PasswordResetToken_tokenHash_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON public."PasswordResetToken" USING btree ("tokenHash");


--
-- TOC entry 5428 (class 1259 OID 448259)
-- Name: PasswordResetToken_userId_expiresAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PasswordResetToken_userId_expiresAt_idx" ON public."PasswordResetToken" USING btree ("userId", "expiresAt");


--
-- TOC entry 5336 (class 1259 OID 424058)
-- Name: Payment_invoiceId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Payment_invoiceId_key" ON public."Payment" USING btree ("invoiceId");


--
-- TOC entry 5360 (class 1259 OID 432719)
-- Name: PayrollRecord_employeeId_payrollMonth_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "PayrollRecord_employeeId_payrollMonth_key" ON public."PayrollRecord" USING btree ("employeeId", "payrollMonth");


--
-- TOC entry 5361 (class 1259 OID 432718)
-- Name: PayrollRecord_payrollMonth_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PayrollRecord_payrollMonth_status_idx" ON public."PayrollRecord" USING btree ("payrollMonth", status);


--
-- TOC entry 5465 (class 1259 OID 465452)
-- Name: PrintDevice_branchId_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PrintDevice_branchId_status_idx" ON public."PrintDevice" USING btree ("branchId", status);


--
-- TOC entry 5466 (class 1259 OID 465451)
-- Name: PrintDevice_deviceCode_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "PrintDevice_deviceCode_key" ON public."PrintDevice" USING btree ("deviceCode");


--
-- TOC entry 5467 (class 1259 OID 465453)
-- Name: PrintDevice_lastHeartbeatAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PrintDevice_lastHeartbeatAt_idx" ON public."PrintDevice" USING btree ("lastHeartbeatAt");


--
-- TOC entry 5487 (class 1259 OID 465464)
-- Name: PrintJob_branchId_status_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PrintJob_branchId_status_createdAt_idx" ON public."PrintJob" USING btree ("branchId", status, "createdAt");


--
-- TOC entry 5488 (class 1259 OID 465463)
-- Name: PrintJob_idempotencyKey_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "PrintJob_idempotencyKey_key" ON public."PrintJob" USING btree ("idempotencyKey");


--
-- TOC entry 5489 (class 1259 OID 465467)
-- Name: PrintJob_invoiceId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PrintJob_invoiceId_idx" ON public."PrintJob" USING btree ("invoiceId");


--
-- TOC entry 5490 (class 1259 OID 465468)
-- Name: PrintJob_kitchenOrderId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PrintJob_kitchenOrderId_idx" ON public."PrintJob" USING btree ("kitchenOrderId");


--
-- TOC entry 5493 (class 1259 OID 465465)
-- Name: PrintJob_printDeviceId_status_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PrintJob_printDeviceId_status_createdAt_idx" ON public."PrintJob" USING btree ("printDeviceId", status, "createdAt");


--
-- TOC entry 5494 (class 1259 OID 465466)
-- Name: PrintJob_printerConfigurationId_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PrintJob_printerConfigurationId_status_idx" ON public."PrintJob" USING btree ("printerConfigurationId", status);


--
-- TOC entry 5470 (class 1259 OID 465455)
-- Name: PrintPairingCode_branchId_expiresAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PrintPairingCode_branchId_expiresAt_idx" ON public."PrintPairingCode" USING btree ("branchId", "expiresAt");


--
-- TOC entry 5471 (class 1259 OID 465454)
-- Name: PrintPairingCode_codeHash_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "PrintPairingCode_codeHash_key" ON public."PrintPairingCode" USING btree ("codeHash");


--
-- TOC entry 5474 (class 1259 OID 465456)
-- Name: PrintPairingCode_usedAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PrintPairingCode_usedAt_idx" ON public."PrintPairingCode" USING btree ("usedAt");


--
-- TOC entry 5475 (class 1259 OID 465457)
-- Name: PrinterConfiguration_branchId_printerType_enabled_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PrinterConfiguration_branchId_printerType_enabled_idx" ON public."PrinterConfiguration" USING btree ("branchId", "printerType", enabled);


--
-- TOC entry 5478 (class 1259 OID 465458)
-- Name: PrinterConfiguration_printDeviceId_enabled_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PrinterConfiguration_printDeviceId_enabled_idx" ON public."PrinterConfiguration" USING btree ("printDeviceId", enabled);


--
-- TOC entry 5353 (class 1259 OID 432663)
-- Name: ProductIngredient_productId_ingredientId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ProductIngredient_productId_ingredientId_key" ON public."ProductIngredient" USING btree ("productId", "ingredientId");


--
-- TOC entry 5481 (class 1259 OID 465460)
-- Name: ProductPrinterRoute_printerConfigurationId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ProductPrinterRoute_printerConfigurationId_idx" ON public."ProductPrinterRoute" USING btree ("printerConfigurationId");


--
-- TOC entry 5482 (class 1259 OID 465459)
-- Name: ProductPrinterRoute_productId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ProductPrinterRoute_productId_key" ON public."ProductPrinterRoute" USING btree ("productId");


--
-- TOC entry 5313 (class 1259 OID 424054)
-- Name: ProductTranslation_productId_locale_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ProductTranslation_productId_locale_key" ON public."ProductTranslation" USING btree ("productId", locale);


--
-- TOC entry 5307 (class 1259 OID 448286)
-- Name: Product_barcode_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Product_barcode_key" ON public."Product" USING btree (barcode);


--
-- TOC entry 5310 (class 1259 OID 424053)
-- Name: Product_sku_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Product_sku_key" ON public."Product" USING btree (sku);


--
-- TOC entry 5434 (class 1259 OID 448263)
-- Name: PurchaseInvoice_branchId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PurchaseInvoice_branchId_idx" ON public."PurchaseInvoice" USING btree ("branchId");


--
-- TOC entry 5435 (class 1259 OID 448266)
-- Name: PurchaseInvoice_dueDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PurchaseInvoice_dueDate_idx" ON public."PurchaseInvoice" USING btree ("dueDate");


--
-- TOC entry 5436 (class 1259 OID 448261)
-- Name: PurchaseInvoice_internalNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "PurchaseInvoice_internalNumber_key" ON public."PurchaseInvoice" USING btree ("internalNumber");


--
-- TOC entry 5439 (class 1259 OID 448265)
-- Name: PurchaseInvoice_purchaseDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PurchaseInvoice_purchaseDate_idx" ON public."PurchaseInvoice" USING btree ("purchaseDate");


--
-- TOC entry 5440 (class 1259 OID 448264)
-- Name: PurchaseInvoice_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PurchaseInvoice_status_idx" ON public."PurchaseInvoice" USING btree (status);


--
-- TOC entry 5441 (class 1259 OID 448262)
-- Name: PurchaseInvoice_supplierId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PurchaseInvoice_supplierId_idx" ON public."PurchaseInvoice" USING btree ("supplierId");


--
-- TOC entry 5454 (class 1259 OID 448269)
-- Name: PurchasePriceHistory_productId_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PurchasePriceHistory_productId_createdAt_idx" ON public."PurchasePriceHistory" USING btree ("productId", "createdAt");


--
-- TOC entry 5390 (class 1259 OID 446161)
-- Name: ShiftClosingDenomination_shiftId_currencyCode_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ShiftClosingDenomination_shiftId_currencyCode_idx" ON public."ShiftClosingDenomination" USING btree ("shiftId", "currencyCode");


--
-- TOC entry 5409 (class 1259 OID 446167)
-- Name: ShiftDiscrepancy_shiftId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ShiftDiscrepancy_shiftId_idx" ON public."ShiftDiscrepancy" USING btree ("shiftId");


--
-- TOC entry 5399 (class 1259 OID 448287)
-- Name: ShiftExpense_approvalStatus_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ShiftExpense_approvalStatus_createdAt_idx" ON public."ShiftExpense" USING btree ("approvalStatus", "createdAt");


--
-- TOC entry 5402 (class 1259 OID 446164)
-- Name: ShiftExpense_shiftId_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ShiftExpense_shiftId_createdAt_idx" ON public."ShiftExpense" USING btree ("shiftId", "createdAt");


--
-- TOC entry 5412 (class 1259 OID 446168)
-- Name: ShiftHandoverDiscrepancy_shiftId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ShiftHandoverDiscrepancy_shiftId_idx" ON public."ShiftHandoverDiscrepancy" USING btree ("shiftId");


--
-- TOC entry 5387 (class 1259 OID 446160)
-- Name: ShiftOpeningDenomination_shiftId_currencyCode_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ShiftOpeningDenomination_shiftId_currencyCode_idx" ON public."ShiftOpeningDenomination" USING btree ("shiftId", "currencyCode");


--
-- TOC entry 5420 (class 1259 OID 446172)
-- Name: ShiftReport_reference_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ShiftReport_reference_key" ON public."ShiftReport" USING btree (reference);


--
-- TOC entry 5421 (class 1259 OID 446173)
-- Name: ShiftReport_shiftId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ShiftReport_shiftId_idx" ON public."ShiftReport" USING btree ("shiftId");


--
-- TOC entry 5405 (class 1259 OID 446165)
-- Name: ShiftReturn_returnNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ShiftReturn_returnNumber_key" ON public."ShiftReturn" USING btree ("returnNumber");


--
-- TOC entry 5406 (class 1259 OID 446166)
-- Name: ShiftReturn_shiftId_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ShiftReturn_shiftId_createdAt_idx" ON public."ShiftReturn" USING btree ("shiftId", "createdAt");


--
-- TOC entry 5444 (class 1259 OID 448268)
-- Name: SupplierPayment_paymentDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SupplierPayment_paymentDate_idx" ON public."SupplierPayment" USING btree ("paymentDate");


--
-- TOC entry 5447 (class 1259 OID 448267)
-- Name: SupplierPayment_supplierId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SupplierPayment_supplierId_idx" ON public."SupplierPayment" USING btree ("supplierId");


--
-- TOC entry 5431 (class 1259 OID 448260)
-- Name: Supplier_active_name_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Supplier_active_name_idx" ON public."Supplier" USING btree (active, name);


--
-- TOC entry 5302 (class 1259 OID 424052)
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- TOC entry 5345 (class 1259 OID 424060)
-- Name: _DiscountCategories_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_DiscountCategories_B_index" ON public."_DiscountCategories" USING btree ("B");


--
-- TOC entry 5348 (class 1259 OID 424061)
-- Name: _DiscountProducts_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_DiscountProducts_B_index" ON public."_DiscountProducts" USING btree ("B");


--
-- TOC entry 5511 (class 2606 OID 424127)
-- Name: AuditLog AuditLog_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5568 (class 2606 OID 448393)
-- Name: CashAdjustment CashAdjustment_shiftId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CashAdjustment"
    ADD CONSTRAINT "CashAdjustment_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES public."CashShift"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5548 (class 2606 OID 446301)
-- Name: CashNotification CashNotification_shiftId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CashNotification"
    ADD CONSTRAINT "CashNotification_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES public."CashShift"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5549 (class 2606 OID 446306)
-- Name: CashNotification CashNotification_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CashNotification"
    ADD CONSTRAINT "CashNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5526 (class 2606 OID 446196)
-- Name: CashRegister CashRegister_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CashRegister"
    ADD CONSTRAINT "CashRegister_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5527 (class 2606 OID 446201)
-- Name: CashShift CashShift_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CashShift"
    ADD CONSTRAINT "CashShift_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5528 (class 2606 OID 446211)
-- Name: CashShift CashShift_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CashShift"
    ADD CONSTRAINT "CashShift_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5529 (class 2606 OID 446216)
-- Name: CashShift CashShift_previousShiftId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CashShift"
    ADD CONSTRAINT "CashShift_previousShiftId_fkey" FOREIGN KEY ("previousShiftId") REFERENCES public."CashShift"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5530 (class 2606 OID 446206)
-- Name: CashShift CashShift_registerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CashShift"
    ADD CONSTRAINT "CashShift_registerId_fkey" FOREIGN KEY ("registerId") REFERENCES public."CashRegister"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5576 (class 2606 OID 465504)
-- Name: CategoryPrinterRoute CategoryPrinterRoute_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CategoryPrinterRoute"
    ADD CONSTRAINT "CategoryPrinterRoute_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5577 (class 2606 OID 465509)
-- Name: CategoryPrinterRoute CategoryPrinterRoute_printerConfigurationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CategoryPrinterRoute"
    ADD CONSTRAINT "CategoryPrinterRoute_printerConfigurationId_fkey" FOREIGN KEY ("printerConfigurationId") REFERENCES public."PrinterConfiguration"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5525 (class 2606 OID 446191)
-- Name: CurrencyDenomination CurrencyDenomination_currencyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CurrencyDenomination"
    ADD CONSTRAINT "CurrencyDenomination_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES public."Currency"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5523 (class 2606 OID 446181)
-- Name: ExchangeRate ExchangeRate_currencyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ExchangeRate"
    ADD CONSTRAINT "ExchangeRate_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES public."Currency"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5524 (class 2606 OID 446186)
-- Name: ExchangeRate ExchangeRate_managerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ExchangeRate"
    ADD CONSTRAINT "ExchangeRate_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5566 (class 2606 OID 448388)
-- Name: InventoryMovement InventoryMovement_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InventoryMovement"
    ADD CONSTRAINT "InventoryMovement_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5567 (class 2606 OID 448383)
-- Name: InventoryMovement InventoryMovement_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InventoryMovement"
    ADD CONSTRAINT "InventoryMovement_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5509 (class 2606 OID 424117)
-- Name: InvoiceItemAddon InvoiceItemAddon_invoiceItemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InvoiceItemAddon"
    ADD CONSTRAINT "InvoiceItemAddon_invoiceItemId_fkey" FOREIGN KEY ("invoiceItemId") REFERENCES public."InvoiceItem"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5506 (class 2606 OID 424112)
-- Name: InvoiceItem InvoiceItem_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InvoiceItem"
    ADD CONSTRAINT "InvoiceItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5507 (class 2606 OID 424102)
-- Name: InvoiceItem InvoiceItem_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InvoiceItem"
    ADD CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public."Invoice"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5508 (class 2606 OID 424107)
-- Name: InvoiceItem InvoiceItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InvoiceItem"
    ADD CONSTRAINT "InvoiceItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5535 (class 2606 OID 446246)
-- Name: InvoicePayment InvoicePayment_currencyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InvoicePayment"
    ADD CONSTRAINT "InvoicePayment_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES public."Currency"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5536 (class 2606 OID 446241)
-- Name: InvoicePayment InvoicePayment_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InvoicePayment"
    ADD CONSTRAINT "InvoicePayment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public."Invoice"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5502 (class 2606 OID 424092)
-- Name: Invoice Invoice_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5503 (class 2606 OID 424087)
-- Name: Invoice Invoice_cashierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_cashierId_fkey" FOREIGN KEY ("cashierId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5504 (class 2606 OID 424097)
-- Name: Invoice Invoice_discountId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES public."DiscountCampaign"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5505 (class 2606 OID 446176)
-- Name: Invoice Invoice_shiftId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES public."CashShift"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5546 (class 2606 OID 446291)
-- Name: KitchenOrder KitchenOrder_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KitchenOrder"
    ADD CONSTRAINT "KitchenOrder_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public."Invoice"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5518 (class 2606 OID 432675)
-- Name: OperatingExpense OperatingExpense_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OperatingExpense"
    ADD CONSTRAINT "OperatingExpense_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5519 (class 2606 OID 448293)
-- Name: OperatingExpense OperatingExpense_expenseCategoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OperatingExpense"
    ADD CONSTRAINT "OperatingExpense_expenseCategoryId_fkey" FOREIGN KEY ("expenseCategoryId") REFERENCES public."ExpenseCategoryMaster"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5520 (class 2606 OID 432721)
-- Name: OperatingExpense OperatingExpense_payrollRecordId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OperatingExpense"
    ADD CONSTRAINT "OperatingExpense_payrollRecordId_fkey" FOREIGN KEY ("payrollRecordId") REFERENCES public."PayrollRecord"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5521 (class 2606 OID 448298)
-- Name: OperatingExpense OperatingExpense_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OperatingExpense"
    ADD CONSTRAINT "OperatingExpense_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public."Supplier"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5550 (class 2606 OID 448288)
-- Name: PasswordResetToken PasswordResetToken_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PasswordResetToken"
    ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5510 (class 2606 OID 424122)
-- Name: Payment Payment_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public."Invoice"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5522 (class 2606 OID 432726)
-- Name: PayrollRecord PayrollRecord_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PayrollRecord"
    ADD CONSTRAINT "PayrollRecord_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5569 (class 2606 OID 465469)
-- Name: PrintDevice PrintDevice_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PrintDevice"
    ADD CONSTRAINT "PrintDevice_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5578 (class 2606 OID 465514)
-- Name: PrintJob PrintJob_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PrintJob"
    ADD CONSTRAINT "PrintJob_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5579 (class 2606 OID 465529)
-- Name: PrintJob PrintJob_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PrintJob"
    ADD CONSTRAINT "PrintJob_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public."Invoice"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5580 (class 2606 OID 465534)
-- Name: PrintJob PrintJob_kitchenOrderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PrintJob"
    ADD CONSTRAINT "PrintJob_kitchenOrderId_fkey" FOREIGN KEY ("kitchenOrderId") REFERENCES public."KitchenOrder"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5581 (class 2606 OID 465539)
-- Name: PrintJob PrintJob_originalPrintJobId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PrintJob"
    ADD CONSTRAINT "PrintJob_originalPrintJobId_fkey" FOREIGN KEY ("originalPrintJobId") REFERENCES public."PrintJob"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5582 (class 2606 OID 465519)
-- Name: PrintJob PrintJob_printDeviceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PrintJob"
    ADD CONSTRAINT "PrintJob_printDeviceId_fkey" FOREIGN KEY ("printDeviceId") REFERENCES public."PrintDevice"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5583 (class 2606 OID 465524)
-- Name: PrintJob PrintJob_printerConfigurationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PrintJob"
    ADD CONSTRAINT "PrintJob_printerConfigurationId_fkey" FOREIGN KEY ("printerConfigurationId") REFERENCES public."PrinterConfiguration"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5570 (class 2606 OID 465474)
-- Name: PrintPairingCode PrintPairingCode_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PrintPairingCode"
    ADD CONSTRAINT "PrintPairingCode_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5571 (class 2606 OID 465479)
-- Name: PrintPairingCode PrintPairingCode_printDeviceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PrintPairingCode"
    ADD CONSTRAINT "PrintPairingCode_printDeviceId_fkey" FOREIGN KEY ("printDeviceId") REFERENCES public."PrintDevice"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5572 (class 2606 OID 465484)
-- Name: PrinterConfiguration PrinterConfiguration_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PrinterConfiguration"
    ADD CONSTRAINT "PrinterConfiguration_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5573 (class 2606 OID 465489)
-- Name: PrinterConfiguration PrinterConfiguration_printDeviceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PrinterConfiguration"
    ADD CONSTRAINT "PrinterConfiguration_printDeviceId_fkey" FOREIGN KEY ("printDeviceId") REFERENCES public."PrintDevice"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5501 (class 2606 OID 424082)
-- Name: ProductAddon ProductAddon_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductAddon"
    ADD CONSTRAINT "ProductAddon_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5516 (class 2606 OID 432670)
-- Name: ProductIngredient ProductIngredient_ingredientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductIngredient"
    ADD CONSTRAINT "ProductIngredient_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES public."Ingredient"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5517 (class 2606 OID 432665)
-- Name: ProductIngredient ProductIngredient_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductIngredient"
    ADD CONSTRAINT "ProductIngredient_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5574 (class 2606 OID 465499)
-- Name: ProductPrinterRoute ProductPrinterRoute_printerConfigurationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductPrinterRoute"
    ADD CONSTRAINT "ProductPrinterRoute_printerConfigurationId_fkey" FOREIGN KEY ("printerConfigurationId") REFERENCES public."PrinterConfiguration"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5575 (class 2606 OID 465494)
-- Name: ProductPrinterRoute ProductPrinterRoute_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductPrinterRoute"
    ADD CONSTRAINT "ProductPrinterRoute_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5500 (class 2606 OID 424077)
-- Name: ProductSize ProductSize_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductSize"
    ADD CONSTRAINT "ProductSize_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5499 (class 2606 OID 424072)
-- Name: ProductTranslation ProductTranslation_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductTranslation"
    ADD CONSTRAINT "ProductTranslation_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5498 (class 2606 OID 424067)
-- Name: Product Product_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5554 (class 2606 OID 448328)
-- Name: PurchaseInvoiceItem PurchaseInvoiceItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseInvoiceItem"
    ADD CONSTRAINT "PurchaseInvoiceItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5555 (class 2606 OID 448323)
-- Name: PurchaseInvoiceItem PurchaseInvoiceItem_purchaseInvoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseInvoiceItem"
    ADD CONSTRAINT "PurchaseInvoiceItem_purchaseInvoiceId_fkey" FOREIGN KEY ("purchaseInvoiceId") REFERENCES public."PurchaseInvoice"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5551 (class 2606 OID 448313)
-- Name: PurchaseInvoice PurchaseInvoice_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseInvoice"
    ADD CONSTRAINT "PurchaseInvoice_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5552 (class 2606 OID 448318)
-- Name: PurchaseInvoice PurchaseInvoice_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseInvoice"
    ADD CONSTRAINT "PurchaseInvoice_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5553 (class 2606 OID 448308)
-- Name: PurchaseInvoice PurchaseInvoice_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseInvoice"
    ADD CONSTRAINT "PurchaseInvoice_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public."Supplier"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5565 (class 2606 OID 448378)
-- Name: PurchasePriceHistory PurchasePriceHistory_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchasePriceHistory"
    ADD CONSTRAINT "PurchasePriceHistory_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5563 (class 2606 OID 448373)
-- Name: PurchaseReturnItem PurchaseReturnItem_purchaseInvoiceItemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseReturnItem"
    ADD CONSTRAINT "PurchaseReturnItem_purchaseInvoiceItemId_fkey" FOREIGN KEY ("purchaseInvoiceItemId") REFERENCES public."PurchaseInvoiceItem"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5564 (class 2606 OID 448368)
-- Name: PurchaseReturnItem PurchaseReturnItem_purchaseReturnId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseReturnItem"
    ADD CONSTRAINT "PurchaseReturnItem_purchaseReturnId_fkey" FOREIGN KEY ("purchaseReturnId") REFERENCES public."PurchaseReturn"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5560 (class 2606 OID 448363)
-- Name: PurchaseReturn PurchaseReturn_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseReturn"
    ADD CONSTRAINT "PurchaseReturn_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5561 (class 2606 OID 448358)
-- Name: PurchaseReturn PurchaseReturn_purchaseInvoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseReturn"
    ADD CONSTRAINT "PurchaseReturn_purchaseInvoiceId_fkey" FOREIGN KEY ("purchaseInvoiceId") REFERENCES public."PurchaseInvoice"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5562 (class 2606 OID 448353)
-- Name: PurchaseReturn PurchaseReturn_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PurchaseReturn"
    ADD CONSTRAINT "PurchaseReturn_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public."Supplier"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5534 (class 2606 OID 446236)
-- Name: ShiftCashCarryover ShiftCashCarryover_shiftId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ShiftCashCarryover"
    ADD CONSTRAINT "ShiftCashCarryover_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES public."CashShift"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5533 (class 2606 OID 446231)
-- Name: ShiftCashWithdrawal ShiftCashWithdrawal_shiftId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ShiftCashWithdrawal"
    ADD CONSTRAINT "ShiftCashWithdrawal_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES public."CashShift"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5532 (class 2606 OID 446226)
-- Name: ShiftClosingDenomination ShiftClosingDenomination_shiftId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ShiftClosingDenomination"
    ADD CONSTRAINT "ShiftClosingDenomination_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES public."CashShift"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5544 (class 2606 OID 446281)
-- Name: ShiftDiscrepancy ShiftDiscrepancy_shiftId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ShiftDiscrepancy"
    ADD CONSTRAINT "ShiftDiscrepancy_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES public."CashShift"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5537 (class 2606 OID 446256)
-- Name: ShiftExpense ShiftExpense_currencyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ShiftExpense"
    ADD CONSTRAINT "ShiftExpense_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES public."Currency"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5538 (class 2606 OID 446261)
-- Name: ShiftExpense ShiftExpense_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ShiftExpense"
    ADD CONSTRAINT "ShiftExpense_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5539 (class 2606 OID 446251)
-- Name: ShiftExpense ShiftExpense_shiftId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ShiftExpense"
    ADD CONSTRAINT "ShiftExpense_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES public."CashShift"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5540 (class 2606 OID 448303)
-- Name: ShiftExpense ShiftExpense_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ShiftExpense"
    ADD CONSTRAINT "ShiftExpense_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public."Supplier"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5545 (class 2606 OID 446286)
-- Name: ShiftHandoverDiscrepancy ShiftHandoverDiscrepancy_shiftId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ShiftHandoverDiscrepancy"
    ADD CONSTRAINT "ShiftHandoverDiscrepancy_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES public."CashShift"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5531 (class 2606 OID 446221)
-- Name: ShiftOpeningDenomination ShiftOpeningDenomination_shiftId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ShiftOpeningDenomination"
    ADD CONSTRAINT "ShiftOpeningDenomination_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES public."CashShift"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5547 (class 2606 OID 446296)
-- Name: ShiftReport ShiftReport_shiftId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ShiftReport"
    ADD CONSTRAINT "ShiftReport_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES public."CashShift"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5541 (class 2606 OID 446271)
-- Name: ShiftReturn ShiftReturn_currencyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ShiftReturn"
    ADD CONSTRAINT "ShiftReturn_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES public."Currency"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5542 (class 2606 OID 446276)
-- Name: ShiftReturn ShiftReturn_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ShiftReturn"
    ADD CONSTRAINT "ShiftReturn_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5543 (class 2606 OID 446266)
-- Name: ShiftReturn ShiftReturn_shiftId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ShiftReturn"
    ADD CONSTRAINT "ShiftReturn_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES public."CashShift"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5556 (class 2606 OID 448343)
-- Name: SupplierPayment SupplierPayment_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SupplierPayment"
    ADD CONSTRAINT "SupplierPayment_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5557 (class 2606 OID 448348)
-- Name: SupplierPayment SupplierPayment_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SupplierPayment"
    ADD CONSTRAINT "SupplierPayment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5558 (class 2606 OID 448338)
-- Name: SupplierPayment SupplierPayment_purchaseInvoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SupplierPayment"
    ADD CONSTRAINT "SupplierPayment_purchaseInvoiceId_fkey" FOREIGN KEY ("purchaseInvoiceId") REFERENCES public."PurchaseInvoice"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5559 (class 2606 OID 448333)
-- Name: SupplierPayment SupplierPayment_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SupplierPayment"
    ADD CONSTRAINT "SupplierPayment_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public."Supplier"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5497 (class 2606 OID 424062)
-- Name: User User_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5512 (class 2606 OID 424132)
-- Name: _DiscountCategories _DiscountCategories_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_DiscountCategories"
    ADD CONSTRAINT "_DiscountCategories_A_fkey" FOREIGN KEY ("A") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5513 (class 2606 OID 424137)
-- Name: _DiscountCategories _DiscountCategories_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_DiscountCategories"
    ADD CONSTRAINT "_DiscountCategories_B_fkey" FOREIGN KEY ("B") REFERENCES public."DiscountCampaign"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5514 (class 2606 OID 424142)
-- Name: _DiscountProducts _DiscountProducts_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_DiscountProducts"
    ADD CONSTRAINT "_DiscountProducts_A_fkey" FOREIGN KEY ("A") REFERENCES public."DiscountCampaign"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5515 (class 2606 OID 424147)
-- Name: _DiscountProducts _DiscountProducts_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_DiscountProducts"
    ADD CONSTRAINT "_DiscountProducts_B_fkey" FOREIGN KEY ("B") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


-- Completed on 2026-10-22 10:17:40

--
-- PostgreSQL database dump complete
--

\unrestrict SsVHpFkJQ6B9l3ol69I0aZhSfWYJyUwZrCRklPf8VJY1BcHzklXEABT1MbUAdK2


# Negotiation Functionality Implementation Summary

## Backend Implementation Completed ✅

### 1. Database Schema Changes
- **New Table**: `counter_offers` - Stores counteroffer details
- **Updated Table**: `offers` - Added counteroffer tracking fields:
  - `counterofferCount` (INT) - Tracks number of counteroffers
  - `originalPrice` (DECIMAL) - Stores original offer price
  - `originalQuantity` (TEXT) - Stores original offer quantity

### 2. New Files Created
- `Backend/src/offers/dto/counter-offer.dto.ts` - DTOs for counteroffer operations
- `Backend/src/offers/counter-offers.service.ts` - Service for counteroffer business logic
- `Backend/src/offers/counter-offers.controller.ts` - Controller for counteroffer endpoints

### 3. Updated Files
- `Backend/src/offers/offers.service.ts` - Added counteroffer data to offer responses
- `Backend/src/offers/offers.controller.ts` - Added counteroffer endpoints
- `Backend/src/offers/offers.module.ts` - Added CounterOffersService
- `Backend/src/offers/dto/offer-response.dto.ts` - Added counteroffer fields
- `Backend/prisma/schema.prisma` - Added CounterOffer model and relations

### 4. API Endpoints Added
- `POST /offers/counter-offers` - Create counteroffer
- `GET /offers/counter-offers/offer/:offerId` - Get counteroffers for offer
- `GET /offers/counter-offers/requirement/:requirementId` - Get counteroffers for requirement
- `PUT /offers/counter-offers/:id` - Update counteroffer
- `POST /offers/counter-offers/accept` - Accept counteroffer
- `POST /offers/counter-offers/reject` - Reject counteroffer
- `DELETE /offers/counter-offers/:id` - Delete counteroffer

### 5. Business Logic Implemented
- **Counteroffer Creation**: Validates negotiable offers, checks authorization, limits to 5 counteroffers
- **Counteroffer Acceptance**: Updates main offer with counteroffer values, stores original values
- **Counteroffer Rejection**: Marks counteroffer as rejected
- **Expiration Handling**: Automatic expiration based on negotiation window
- **Authorization**: Ensures only authorized parties can create/accept/reject counteroffers

## Database Migration Required

The following SQL needs to be executed on the database:

```sql
-- Add new fields to offers table
ALTER TABLE "offers" ADD COLUMN "counterofferCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "offers" ADD COLUMN "originalPrice" DECIMAL(10,2);
ALTER TABLE "offers" ADD COLUMN "originalQuantity" TEXT;

-- Create CounterOfferStatus enum
CREATE TYPE "CounterOfferStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED');

-- Create counter_offers table
CREATE TABLE "counter_offers" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "fromId" TEXT NOT NULL,
    "requirementId" TEXT NOT NULL,
    "counterofferNumber" INTEGER NOT NULL,
    "offeredPrice" DECIMAL(10,2) NOT NULL,
    "offeredQuantity" TEXT NOT NULL,
    "status" "CounterOfferStatus" NOT NULL DEFAULT 'PENDING',
    "negotiationWindowHours" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "counter_offers_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraints
ALTER TABLE "counter_offers" ADD CONSTRAINT "counter_offers_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "counter_offers" ADD CONSTRAINT "counter_offers_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "counter_offers" ADD CONSTRAINT "counter_offers_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "requirements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

## Next Steps

1. **Execute Database Migration**: Run the SQL script above on the database
2. **Test API Endpoints**: Verify all counteroffer endpoints work correctly
3. **Frontend Implementation**: Implement counteroffer UI components
4. **Integration Testing**: Test the complete negotiation flow

## Key Features Implemented

- ✅ Counteroffer creation with validation
- ✅ Counteroffer acceptance (updates main offer)
- ✅ Counteroffer rejection
- ✅ Expiration handling
- ✅ Authorization checks
- ✅ Maximum 5 counteroffers limit
- ✅ Original values preservation
- ✅ Complete API documentation with Swagger
- ✅ Error handling and validation
- ✅ Database relations and constraints

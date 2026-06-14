-- ==============================================================================
-- CATERING CATALOG SEEDER (50 ITEMS)
-- ==============================================================================
-- This script seeds a concise catering catalog with 50 premium items.
-- It automatically targets the FIRST organization found in the database.
-- ==============================================================================

DO $$
DECLARE
    target_org_id uuid;
    cat_appetizers_id uuid;
    cat_meat_id uuid;
    cat_seafood_id uuid;
    cat_veggie_id uuid;
    cat_sides_id uuid;
    cat_desserts_id uuid;
    cat_beverages_id uuid;
    cat_equipment_id uuid;
BEGIN
    -- 1. Identify Target Organization
    SELECT id INTO target_org_id FROM public.organizations LIMIT 1;

    IF target_org_id IS NULL THEN
        RAISE NOTICE 'No organization found. Creating default organizations...';
        
        INSERT INTO public.organizations (id, name, slug, email, phone, currency) VALUES
        (gen_random_uuid(), 'Acme Catering Co.', 'acme-catering-co', 'contact@acmecatering.com', '+1 (555) 123-4567', 'USD')
        RETURNING id INTO target_org_id;

        INSERT INTO public.organizations (id, name, slug, email, phone, currency) VALUES
        (gen_random_uuid(), 'Global Feasts Inc.', 'global-feasts-inc', 'hello@globalfeasts.com', '+1 (555) 987-6543', 'EUR');
    END IF;

    RAISE NOTICE 'Seeding data for Organization ID: %', target_org_id;

    -- Clear existing catalog data for this org to prevent duplicates
    DELETE FROM public.items WHERE organization_id = target_org_id;
    DELETE FROM public.categories WHERE organization_id = target_org_id;

    -- 2. Create Categories
    INSERT INTO public.categories (organization_id, name, description) VALUES
    (target_org_id, 'Appetizers & Canapés', 'Bite-sized starters for events and cocktail parties.'),
    (target_org_id, 'Main Courses - Meat & Poultry', 'Hearty meat-based main dishes.'),
    (target_org_id, 'Main Courses - Seafood', 'Fresh seafood selections.'),
    (target_org_id, 'Vegetarian & Vegan', 'Plant-based main courses and options.'),
    (target_org_id, 'Sides & Salads', 'Accompaniments and fresh greens.'),
    (target_org_id, 'Desserts & Sweets', 'Signature cakes, pastries, and treats.'),
    (target_org_id, 'Beverages', 'Hot and cold drinks, juices, and coffee.'),
    (target_org_id, 'Equipment & Staff', 'Rentals and professional service staff.');

    -- Get IDs for the created categories
    SELECT id INTO cat_appetizers_id FROM public.categories WHERE organization_id = target_org_id AND name = 'Appetizers & Canapés';
    SELECT id INTO cat_meat_id FROM public.categories WHERE organization_id = target_org_id AND name = 'Main Courses - Meat & Poultry';
    SELECT id INTO cat_seafood_id FROM public.categories WHERE organization_id = target_org_id AND name = 'Main Courses - Seafood';
    SELECT id INTO cat_veggie_id FROM public.categories WHERE organization_id = target_org_id AND name = 'Vegetarian & Vegan';
    SELECT id INTO cat_sides_id FROM public.categories WHERE organization_id = target_org_id AND name = 'Sides & Salads';
    SELECT id INTO cat_desserts_id FROM public.categories WHERE organization_id = target_org_id AND name = 'Desserts & Sweets';
    SELECT id INTO cat_beverages_id FROM public.categories WHERE organization_id = target_org_id AND name = 'Beverages';
    SELECT id INTO cat_equipment_id FROM public.categories WHERE organization_id = target_org_id AND name = 'Equipment & Staff';

    -- 3. Insert Items (50 total)

    -- Appetizers & Canapés (8 items)
    INSERT INTO public.items (organization_id, category_id, name, description, unit, price) VALUES
    (target_org_id, cat_appetizers_id, 'Mini Beef Wellington', 'Tender beef with mushroom duxelles in puff pastry.', 'Piece', 4.50),
    (target_org_id, cat_appetizers_id, 'Smoked Salmon Blinis', 'With dill cream cheese and capers.', 'Dozen', 32.00),
    (target_org_id, cat_appetizers_id, 'Caprese Skewers', 'Cherry tomato, bocconcini, and basil with balsamic glaze.', 'Piece', 2.25),
    (target_org_id, cat_appetizers_id, 'Chicken Satay Skewers', 'With spicy peanut dipping sauce.', 'Dozen', 28.00),
    (target_org_id, cat_appetizers_id, 'Mini Crab Cakes', 'With zesty lemon aioli.', 'Piece', 5.00),
    (target_org_id, cat_appetizers_id, 'Vegetable Spring Rolls', 'Served with sweet chili sauce.', 'Dozen', 18.00),
    (target_org_id, cat_appetizers_id, 'Stuffed Mushrooms', 'With spinach and ricotta cheese.', 'Dozen', 22.00),
    (target_org_id, cat_appetizers_id, 'Arancini Balls', 'Crispy risotto balls with truffle oil.', 'Dozen', 24.00);

    -- Main Courses - Meat & Poultry (8 items)
    INSERT INTO public.items (organization_id, category_id, name, description, unit, price) VALUES
    (target_org_id, cat_meat_id, 'Herb Roasted Chicken', 'Slow-roasted with rosemary and lemon.', 'Portion', 14.50),
    (target_org_id, cat_meat_id, 'Beef Lasagna', 'Traditional Italian recipe with rich ragu.', 'Tray (10pax)', 120.00),
    (target_org_id, cat_meat_id, 'Braised Short Ribs', 'Red wine reduction with root vegetables.', 'Portion', 22.00),
    (target_org_id, cat_meat_id, 'Chicken Tikka Masala', 'Medium spicy creamy curry.', 'Portion', 16.00),
    (target_org_id, cat_meat_id, 'Roast Beef Striploin', 'Served with red wine au jus.', 'Portion', 24.00),
    (target_org_id, cat_meat_id, 'BBQ Glazed Pork Ribs', 'Slow-cooked and tender.', 'Rack', 28.00),
    (target_org_id, cat_meat_id, 'Chicken Schnitzel', 'Crispy breaded chicken breast.', 'Portion', 13.00),
    (target_org_id, cat_meat_id, 'Turkey Breast Roast', 'With cranberry sauce and gravy.', 'Portion', 18.00);

    -- Main Courses - Seafood (6 items)
    INSERT INTO public.items (organization_id, category_id, name, description, unit, price) VALUES
    (target_org_id, cat_seafood_id, 'Grilled Atlantic Salmon', 'With lemon butter sauce.', 'Portion', 19.50),
    (target_org_id, cat_seafood_id, 'Seafood Paella', 'Classic Spanish rice with prawns, mussels, and squid.', 'Tray (10pax)', 180.00),
    (target_org_id, cat_seafood_id, 'Garlic Butter Prawns', 'Sautéed with parsley and white wine.', 'Dozen', 36.00),
    (target_org_id, cat_seafood_id, 'Baked Sea Bass', 'With ginger and soy glaze.', 'Portion', 25.00),
    (target_org_id, cat_seafood_id, 'Shrimp Scampi Pasta', 'Linguine with lemon and garlic shrimp.', 'Portion', 18.00),
    (target_org_id, cat_seafood_id, 'Crispy Skin Barramundi', 'With tomato salsa.', 'Portion', 21.00);

    -- Vegetarian & Vegan (6 items)
    INSERT INTO public.items (organization_id, category_id, name, description, unit, price) VALUES
    (target_org_id, cat_veggie_id, 'Mushroom Risotto', 'Creamy arborio rice with wild mushrooms.', 'Portion', 14.00),
    (target_org_id, cat_veggie_id, 'Vegetable Curry', 'Seasonal veggies in coconut milk sauce.', 'Portion', 13.00),
    (target_org_id, cat_veggie_id, 'Eggplant Parmigiana', 'Layered eggplant with tomato and mozzarella.', 'Tray (10pax)', 95.00),
    (target_org_id, cat_veggie_id, 'Falafel Wrap Platter', 'With hummus and pickled veggies.', 'Platter', 55.00),
    (target_org_id, cat_veggie_id, 'Vegan Mac & Cheese', 'With cashew-based cheese sauce.', 'Portion', 16.00),
    (target_org_id, cat_veggie_id, 'Tofu Stir-Fry', 'With broccoli and snap peas.', 'Portion', 13.50);

    -- Sides & Salads (6 items)
    INSERT INTO public.items (organization_id, category_id, name, description, unit, price) VALUES
    (target_org_id, cat_sides_id, 'Caesar Salad', 'Romaine, croutons, parmesan, and dressing.', 'Bowl (Large)', 35.00),
    (target_org_id, cat_sides_id, 'Greek Salad', 'Cucumber, tomato, olives, and feta.', 'Bowl (Large)', 38.00),
    (target_org_id, cat_sides_id, 'Roasted Root Vegetables', 'Honey glazed carrots and parsnips.', 'Tray', 45.00),
    (target_org_id, cat_sides_id, 'Garlic Mashed Potatoes', 'Creamy and buttery.', 'Tray', 40.00),
    (target_org_id, cat_sides_id, 'Basmati Rice', 'Steamed and fluffy.', 'Tray', 25.00),
    (target_org_id, cat_sides_id, 'Truffle Fries', 'With parmesan and parsley.', 'Portion', 8.00);

    -- Desserts & Sweets (6 items)
    INSERT INTO public.items (organization_id, category_id, name, description, unit, price) VALUES
    (target_org_id, cat_desserts_id, 'Chocolate Brownies', 'Rich and fudgy with walnuts.', 'Dozen', 24.00),
    (target_org_id, cat_desserts_id, 'New York Cheesecake', 'Classic creamy recipe.', 'Whole Cake', 45.00),
    (target_org_id, cat_desserts_id, 'Assorted Macarons', 'Colorful French pastries.', 'Box of 12', 30.00),
    (target_org_id, cat_desserts_id, 'Tiramisu', 'Coffee-soaked ladyfingers and mascarpone.', 'Tray (10pax)', 55.00),
    (target_org_id, cat_desserts_id, 'Mini Fruit Tarts', 'With vanilla custard.', 'Dozen', 28.00),
    (target_org_id, cat_desserts_id, 'Apple Crumble', 'Served warm with cinnamon.', 'Tray (10pax)', 48.00);

    -- Beverages (6 items)
    INSERT INTO public.items (organization_id, category_id, name, description, unit, price) VALUES
    (target_org_id, cat_beverages_id, 'Fresh Orange Juice', '100% natural.', 'Litre', 8.00),
    (target_org_id, cat_beverages_id, 'Sparkling Water', 'Bottled 750ml.', 'Bottle', 4.50),
    (target_org_id, cat_beverages_id, 'Assorted Soft Drinks', 'Coke, Sprite, Fanta (Cans).', 'Can', 2.50),
    (target_org_id, cat_beverages_id, 'Freshly Brewed Coffee', 'Premium Arabica blend.', 'Flask (2L)', 25.00),
    (target_org_id, cat_beverages_id, 'English Breakfast Tea', 'Assorted Twinings tea bags.', 'Set (10pax)', 15.00),
    (target_org_id, cat_beverages_id, 'Homemade Lemonade', 'Zesty and cool.', 'Jug', 12.00);

    -- Equipment & Staff (4 items)
    INSERT INTO public.items (organization_id, category_id, name, description, unit, price) VALUES
    (target_org_id, cat_equipment_id, 'Chafing Dish', 'Stainless steel with fuel.', 'Unit/Day', 15.00),
    (target_org_id, cat_equipment_id, 'White Table Linen', 'For 6ft rectangular table.', 'Unit/Day', 12.00),
    (target_org_id, cat_equipment_id, 'Waiter/Waitress', 'Professional table service.', 'Hour', 25.00),
    (target_org_id, cat_equipment_id, 'Bartender', 'Skilled mixologist.', 'Hour', 35.00);

END $$;

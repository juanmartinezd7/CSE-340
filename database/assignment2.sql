--Update statement to insert new record in account table
INSERT INTO public.account (
        account_firstname,
        account_lastname,
        account_email,
        account_password
    )
VALUES (
        'Tony',
        'Stark',
        'tony@starkent.com',
        'Iam1ronM@n'
    );
--Update statement to change the account_type to "Admin".
UPDATE public.account
SET account_type = 'Admin'
WHERE account_email = 'tony@starkent.com';
--Statement to Delete Tony Stark from the account table
DELETE FROM public.account
WHERE account_firstname = 'Tony'
    AND account_lastname = 'Stark'
    AND account_email = 'tony@starkent.com';
--Update statement to replace "the small interiors" text, to "a huge interior" from inv_description
UPDATE public.inventory
SET inv_description = REPLACE(
        inv_description,
        'the small interiors',
        'a huge interior'
    )
WHERE inv_make = 'GM'
    AND inv_model = 'Hummer'
    AND inv_description LIKE '%the small interiors%';
--Inner join to select the make and model fields from the inventory table and the classification name field
-- from the classification table for inventory items that belong to the "Sport" category.
SELECT i.inv_make,
    i.inv_model,
    c.classification_name
FROM public.inventory AS i
    INNER JOIN public.classification AS c ON i.classification_id = c.classification_id
WHERE c.classification_name = 'Sport';
--Update all records in the inventory table to add "/vehicles" to the middle of the file path
-- in the inv_image and inv_thumbnail columns
BEGIN;
UPDATE public.inventory
SET inv_image = REGEXP_REPLACE(
        inv_image,
        '(^|/)images/(?!vehicles/)',
        '\1images/vehicles/',
        'g'
    ),
    inv_thumbnail = REGEXP_REPLACE(
        inv_thumbnail,
        '(^|/)images/(?!vehicles/)',
        '\1images/vehicles/',
        'g'
    )
WHERE inv_image ~ '(^|/)images/(?!vehicles/)'
    OR inv_thumbnail ~ '(^|/)images/(?!vehicles/)';
COMMIT;
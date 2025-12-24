"use client";

import { useEffect, useState, useRef } from "react";
import type { ExtractedData } from "@/lib/types";

type Props = {
  data: ExtractedData;
  onChange: (data: ExtractedData) => void;
};

// Confidence display removed per request

export default function FieldEditor({ data, onChange }: Props) {
  const [local, setLocal] = useState<ExtractedData>({ ...data });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset when the component receives completely new data (different document)
  // We use a stable ID based on document filename or a unique field combination
  const documentKey = `${data.name}-${data.surname}-${data.date}-${data.address_street}`;
  const prevDocumentKey = useRef(documentKey);

  useEffect(() => {
    if (prevDocumentKey.current !== documentKey) {
      prevDocumentKey.current = documentKey;
      setLocal({ ...data });
      setErrors({});
    }
  }, [data, documentKey]);

  const validateField = (key: string, value: any): string | null => {
    switch (key) {
      case "name":
      case "surname":
      case "address_street":
      case "address_house_number":
      case "address_zip_code":
      case "address_city":
      case "landlord_entity":
        if (!value || String(value).trim() === "")
          return "This field is required.";
        return null;
      case "warm_rent":
      case "cold_rent":
      case "deposit":
      case "contract_term_months":
      case "notice_period_months":
        if (value === null || value === undefined || value === "") {
          // only warm_rent and cold_rent are required
          if (key === "warm_rent" || key === "cold_rent")
            return "This field is required.";
          return null;
        }
        if (Number.isNaN(Number(value))) return "Must be a number.";
        if (Number(value) < 0) return "Must be zero or positive.";
        return null;
      case "date":
        if (!value) return "Date is required.";
        if (Number.isNaN(new Date(value).getTime())) return "Invalid date.";
        return null;
      case "rent_increase_type":
        if (!value) return "Please select a rent increase type.";
        return null;
      default:
        return null;
    }
  };

  const handleChange = (key: string, value: any) => {
    const updated = { ...local, [key]: value } as ExtractedData;
    setLocal(updated);
    // validate
    const err = validateField(key, value);
    setErrors((s) => {
      const copy = { ...s };
      if (err) copy[key] = err;
      else delete copy[key];
      return copy;
    });
    onChange(updated);
  };

  const fieldClass = () =>
    "w-full rounded border px-2 py-1 border-gray-200 dark:border-gray-700 text-sm break-words";

  return (
    <form
      className="space-y-3 overflow-hidden"
      onSubmit={(e) => e.preventDefault()}
    >
      <div className="grid grid-cols-1 gap-2">
        <label className="flex flex-col">
          <span className="text-sm font-medium">Name</span>
          <div className="flex items-center">
            <input
              id="name"
              className={fieldClass()}
              type="text"
              value={local.name ?? ""}
              onChange={(e) => handleChange("name", e.target.value)}
              aria-invalid={!!errors["name"]}
              aria-describedby={errors["name"] ? "err-name" : undefined}
            />
          </div>
          {errors["name"] && (
            <p id="err-name" role="alert" className="text-xs text-red-600 mt-1">
              {errors["name"]}
            </p>
          )}
        </label>

        <label className="flex flex-col">
          <span className="text-sm font-medium">Surname</span>
          <div className="flex items-center">
            <input
              id="surname"
              className={fieldClass()}
              type="text"
              value={local.surname ?? ""}
              onChange={(e) => handleChange("surname", e.target.value)}
              aria-invalid={!!errors["surname"]}
              aria-describedby={errors["surname"] ? "err-surname" : undefined}
            />
          </div>
          {errors["surname"] && (
            <p
              id="err-surname"
              role="alert"
              className="text-xs text-red-600 mt-1"
            >
              {errors["surname"]}
            </p>
          )}
        </label>

        <div className="grid grid-cols-1 gap-2">
          <label className="flex flex-col">
            <span className="text-sm font-medium">Street</span>
            <div className="flex items-center">
              <input
                id="address_street"
                className={fieldClass()}
                type="text"
                value={local.address_street ?? ""}
                onChange={(e) => handleChange("address_street", e.target.value)}
                aria-invalid={!!errors["address_street"]}
                aria-describedby={
                  errors["address_street"] ? "err-address_street" : undefined
                }
              />
            </div>
            {errors["address_street"] && (
              <p
                id="err-address_street"
                role="alert"
                className="text-xs text-red-600 mt-1"
              >
                {errors["address_street"]}
              </p>
            )}
          </label>

          <label className="flex flex-col">
            <span className="text-sm font-medium">House number</span>
            <div className="flex items-center">
              <input
                id="address_house_number"
                className={fieldClass()}
                type="text"
                value={local.address_house_number ?? ""}
                onChange={(e) =>
                  handleChange("address_house_number", e.target.value)
                }
                aria-invalid={!!errors["address_house_number"]}
                aria-describedby={
                  errors["address_house_number"]
                    ? "err-address_house_number"
                    : undefined
                }
              />
            </div>
            {errors["address_house_number"] && (
              <p
                id="err-address_house_number"
                role="alert"
                className="text-xs text-red-600 mt-1"
              >
                {errors["address_house_number"]}
              </p>
            )}
          </label>

          <label className="flex flex-col">
            <span className="text-sm font-medium">ZIP code</span>
            <div className="flex items-center">
              <input
                id="address_zip_code"
                className={fieldClass()}
                type="text"
                value={local.address_zip_code ?? ""}
                onChange={(e) =>
                  handleChange("address_zip_code", e.target.value)
                }
                aria-invalid={!!errors["address_zip_code"]}
                aria-describedby={
                  errors["address_zip_code"]
                    ? "err-address_zip_code"
                    : undefined
                }
              />
            </div>
            {errors["address_zip_code"] && (
              <p
                id="err-address_zip_code"
                role="alert"
                className="text-xs text-red-600 mt-1"
              >
                {errors["address_zip_code"]}
              </p>
            )}
          </label>

          <label className="flex flex-col">
            <span className="text-sm font-medium">City</span>
            <div className="flex items-center">
              <input
                id="address_city"
                className={fieldClass()}
                type="text"
                value={local.address_city ?? ""}
                onChange={(e) => handleChange("address_city", e.target.value)}
                aria-invalid={!!errors["address_city"]}
                aria-describedby={
                  errors["address_city"] ? "err-address_city" : undefined
                }
              />
            </div>
            {errors["address_city"] && (
              <p
                id="err-address_city"
                role="alert"
                className="text-xs text-red-600 mt-1"
              >
                {errors["address_city"]}
              </p>
            )}
          </label>
        </div>

        <label className="flex flex-col">
          <span className="text-sm font-medium">Warm rent</span>
          <div className="flex items-center">
            <input
              id="warm_rent"
              className={fieldClass()}
              type="number"
              value={local.warm_rent ?? ""}
              onChange={(e) =>
                handleChange(
                  "warm_rent",
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              aria-invalid={!!errors["warm_rent"]}
              aria-describedby={
                errors["warm_rent"] ? "err-warm_rent" : undefined
              }
            />
          </div>
          {errors["warm_rent"] && (
            <p
              id="err-warm_rent"
              role="alert"
              className="text-xs text-red-600 mt-1"
            >
              {errors["warm_rent"]}
            </p>
          )}
        </label>

        <label className="flex flex-col">
          <span className="text-sm font-medium">Cold rent</span>
          <div className="flex items-center">
            <input
              id="cold_rent"
              className={fieldClass()}
              type="number"
              value={local.cold_rent ?? ""}
              onChange={(e) =>
                handleChange(
                  "cold_rent",
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              aria-invalid={!!errors["cold_rent"]}
              aria-describedby={
                errors["cold_rent"] ? "err-cold_rent" : undefined
              }
            />
          </div>
          {errors["cold_rent"] && (
            <p
              id="err-cold_rent"
              role="alert"
              className="text-xs text-red-600 mt-1"
            >
              {errors["cold_rent"]}
            </p>
          )}
        </label>

        <label className="flex flex-col">
          <span className="text-sm font-medium">Deposit</span>
          <div className="flex items-center">
            <input
              id="deposit"
              className={fieldClass()}
              type="number"
              value={local.deposit ?? ""}
              onChange={(e) =>
                handleChange(
                  "deposit",
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              aria-invalid={!!errors["deposit"]}
              aria-describedby={errors["deposit"] ? "err-deposit" : undefined}
            />
          </div>
          {errors["deposit"] && (
            <p
              id="err-deposit"
              role="alert"
              className="text-xs text-red-600 mt-1"
            >
              {errors["deposit"]}
            </p>
          )}
        </label>

        <label className="flex flex-col">
          <span className="text-sm font-medium">Contract term (months)</span>
          <div className="flex items-center">
            <input
              id="contract_term_months"
              className={fieldClass()}
              type="number"
              value={local.contract_term_months ?? ""}
              onChange={(e) =>
                handleChange(
                  "contract_term_months",
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              aria-invalid={!!errors["contract_term_months"]}
              aria-describedby={
                errors["contract_term_months"]
                  ? "err-contract_term_months"
                  : undefined
              }
            />
          </div>
          {errors["contract_term_months"] && (
            <p
              id="err-contract_term_months"
              role="alert"
              className="text-xs text-red-600 mt-1"
            >
              {errors["contract_term_months"]}
            </p>
          )}
        </label>

        <label className="flex flex-col">
          <span className="text-sm font-medium">Notice period (months)</span>
          <div className="flex items-center">
            <input
              id="notice_period_months"
              className={fieldClass()}
              type="number"
              value={local.notice_period_months ?? ""}
              onChange={(e) =>
                handleChange(
                  "notice_period_months",
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              aria-invalid={!!errors["notice_period_months"]}
              aria-describedby={
                errors["notice_period_months"]
                  ? "err-notice_period_months"
                  : undefined
              }
            />
          </div>
          {errors["notice_period_months"] && (
            <p
              id="err-notice_period_months"
              role="alert"
              className="text-xs text-red-600 mt-1"
            >
              {errors["notice_period_months"]}
            </p>
          )}
        </label>

        <label className="flex flex-col">
          <span className="text-sm font-medium">Rent increase type</span>
          <div className="flex items-center">
            <select
              id="rent_increase_type"
              className={fieldClass()}
              value={(local.rent_increase_type as string) ?? ""}
              onChange={(e) =>
                handleChange("rent_increase_type", e.target.value)
              }
              aria-invalid={!!errors["rent_increase_type"]}
              aria-describedby={
                errors["rent_increase_type"]
                  ? "err-rent_increase_type"
                  : undefined
              }
            >
              <option value="">Select type</option>
              <option value={"fixed"}>Fixed</option>
              <option value={"indexed"}>Indexed</option>
              <option value={"stepped"}>Stepped</option>
              <option value={"none"}>None</option>
            </select>
          </div>
          {errors["rent_increase_type"] && (
            <p
              id="err-rent_increase_type"
              role="alert"
              className="text-xs text-red-600 mt-1"
            >
              {errors["rent_increase_type"]}
            </p>
          )}
        </label>

        <label className="flex flex-col">
          <span className="text-sm font-medium">Date</span>
          <div className="flex items-center">
            <input
              id="date"
              className={fieldClass()}
              type="date"
              value={local.date ?? ""}
              onChange={(e) => handleChange("date", e.target.value)}
              aria-invalid={!!errors["date"]}
              aria-describedby={errors["date"] ? "err-date" : undefined}
            />
          </div>
          {errors["date"] && (
            <p id="err-date" role="alert" className="text-xs text-red-600 mt-1">
              {errors["date"]}
            </p>
          )}
        </label>

        <label className="flex items-center justify-between">
          <div>
            <span className="text-sm font-medium">Active</span>
          </div>
          <div className="flex items-center">
            <input
              id="is_active"
              type="checkbox"
              checked={!!local.is_active}
              onChange={(e) => handleChange("is_active", e.target.checked)}
              aria-checked={!!local.is_active}
            />
          </div>
        </label>

        <label className="flex flex-col">
          <span className="text-sm font-medium">Landlord</span>
          <div className="flex items-center">
            <input
              id="landlord_entity"
              className={fieldClass()}
              type="text"
              value={local.landlord_entity ?? ""}
              onChange={(e) => handleChange("landlord_entity", e.target.value)}
              aria-invalid={!!errors["landlord_entity"]}
              aria-describedby={
                errors["landlord_entity"] ? "err-landlord_entity" : undefined
              }
            />
          </div>
          {errors["landlord_entity"] && (
            <p
              id="err-landlord_entity"
              role="alert"
              className="text-xs text-red-600 mt-1"
            >
              {errors["landlord_entity"]}
            </p>
          )}
        </label>
      </div>
    </form>
  );
}

import * as React from "react";
import { useForm, Resolver, useFieldArray } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { socket, useSessionContext } from "../../context/SessionContext";

type FormValues = {
  name: string;
  features: { text: string }[];
};

const resolver: Resolver<FormValues> = async (values) => {
  return {
    values: values.name ? values : {},
    errors: !values.name
      ? {
          name: {
            type: "required",
            message: "This is required.",
          },
        }
      : {},
  };
};

export function Home() {
  const { setId } = useSessionContext();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setFocus,
  } = useForm<FormValues>({
    resolver,
    defaultValues: { features: [{ text: "" }] },
  });

  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray(
    {
      name: "features",
      control,
    }
  );

  const onSubmit = handleSubmit((data) => {
    socket.emit("add_session", { name: data.name }, (resp: any) => {
      console.log(resp);

      const savedSessions = window.localStorage.getItem("sessions");

      const newSession = { id: resp.id, name: data.name };

      if (savedSessions) {
        const parsedSessions = JSON.parse(savedSessions);

        window.localStorage.setItem(
          "sessions",
          JSON.stringify([...parsedSessions, newSession])
        );
      } else {
        window.localStorage.setItem("sessions", JSON.stringify([newSession]));
      }

      navigate(`/session/${resp.id}`);
    });
  });

  return (
    <div className={"flex h-full w-full items-center justify-center"}>
      <div>
        <form onSubmit={onSubmit}>
          <input {...register("name")} placeholder="Bill" />
          <div className={"flex flex-col bg-blue-300"}>
            {fields.map((field, index: number) => (
              <input
                key={field.id}
                {...register(`features.${index}.text` as const)}
                className={"bg-red-300"}
              />
            ))}
            <button
              onClick={() => {
                append(
                  { text: "" },
                  {
                    focusName: `features.${fields.length - 1}.text`,
                    shouldFocus: true,
                  }
                );
              }}
            >
              Add Feature
            </button>
          </div>
          <input type="button" />
        </form>
      </div>
    </div>
  );
}

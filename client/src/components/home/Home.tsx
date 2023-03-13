import * as React from "react";
import { useForm, Resolver } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { socket, useSessionContext } from "../../context/SessionContext";

type FormValues = {
  name: string;
};

const resolver: Resolver<FormValues> = async (values) => {
  return {
    values: values.name ? values : {},
    errors: !values.name
      ? {
          firstName: {
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
    formState: { errors },
  } = useForm<FormValues>({ resolver });
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
    <div
      className={"flex h-full w-full items-center justify-center bg-blue-400"}
    >
      <div>
        <form onSubmit={onSubmit}>
          <input {...register("name")} placeholder="Bill" />
          {errors?.name && <p>{errors.name.message}</p>}
          <input type="submit" />
        </form>
      </div>
    </div>
  );
}

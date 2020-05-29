defmodule PhoenixVideoStream.Repo do
  use Ecto.Repo,
    otp_app: :phoenix_video_stream,
    adapter: Ecto.Adapters.Postgres
end

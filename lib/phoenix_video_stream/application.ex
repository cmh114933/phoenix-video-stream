defmodule PhoenixVideoStream.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  def start(_type, _args) do
    children = [
      # Start the Ecto repository
      PhoenixVideoStream.Repo,
      # Start the Telemetry supervisor
      PhoenixVideoStreamWeb.Telemetry,
      # Start the PubSub system
      {Phoenix.PubSub, name: PhoenixVideoStream.PubSub},
      # Start the Endpoint (http/https)
      PhoenixVideoStreamWeb.Endpoint
      # Start a worker by calling: PhoenixVideoStream.Worker.start_link(arg)
      # {PhoenixVideoStream.Worker, arg}
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: PhoenixVideoStream.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  def config_change(changed, _new, removed) do
    PhoenixVideoStreamWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end

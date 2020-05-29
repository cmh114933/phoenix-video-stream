defmodule PhoenixVideoStreamWeb.PageController do
  use PhoenixVideoStreamWeb, :controller

  def index(conn, _params) do
    render(conn, "index.html")
  end
end

const deleteProduct = async (event) => {
  const parentDiv = event.parentNode;
  const productId = parentDiv.querySelector("[name=productId]").value;
  const csrfToken = parentDiv.querySelector("[name=_csrf]").value;
  const response = await fetch(`/admin/product/${productId}`, {
    headers: { "Content-Type": "application/json", "csrf-token": csrfToken },
    method: "DELETE",
  });

  if (response.ok) {
    parentDiv.parentNode.remove();
  } else {
    const responseData = await response.json();
    console.log(responseData);
  }
};
